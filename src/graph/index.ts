import Graph from "graphology";
import force from "graphology-layout-force";
import louvain from "graphology-communities-louvain";
import { uniqBy } from "lodash-es";

import type { WeightedTagWithRelated } from "../schemata";

export default function makeGraph(tags: WeightedTagWithRelated[]) {
  const relationships = uniqBy(
    tags.flatMap(({ name, related }) =>
      related.map(({ name: relatedName, weight }) => ({
        source: name,
        target: relatedName,
        weight,
      }))
    ),
    ({ source, target }) => `${source}<->${target}`
  );

  // 1. Ініціалізація графа
  const graph = new Graph();

  console.log(`🔹 Починаємо обробку ${tags.length} жанрів...`);

  // 2. Додавання вузлів (Жанрів)
  // Нормалізуємо розмір вузла, щоб популярні не перекривали все (логарифмічна шкала)
  // const MAX_POPULARITY = Math.max(...tags.map((g) => g.weight));
  // const MIN_POPULARITY = Math.min(...tags.map((g) => g.weight));
  const MIN_NODE_SIZE = 5;
  const NODE_SCALE_FACTOR = 1.5; // Множник розміру
  // 1. Ініціалізація з Z-координатою
  tags.forEach((genre) => {
    const size = Math.log(genre.weight + 1) * NODE_SCALE_FACTOR + MIN_NODE_SIZE;

    graph.addNode(genre.name, {
      label: genre.name,
      size: size,
      // Розкидаємо по КУБУ, а не по квадрату
      x: Math.random() * 1000,
      y: Math.random() * 1000,
      z: Math.random() * 1000, // <--- Додаємо Z
      originalPopularity: genre.weight,
    });
  });

  // 3. Додавання ребер (Зв'язків) з PRUNING (Обрізанням)
  console.log("🔹 Будуємо зв'язки та фільтруємо слабкі...");

  // Створюємо мапу зв'язків для швидкого доступу
  // Припустимо, rawRelationships це масив { source, target, weight }
  const relationsMap = new Map<string, { target: string; weight: number }[]>();

  relationships.forEach((rel) => {
    if (!relationsMap.has(rel.source)) relationsMap.set(rel.source, []);
    relationsMap
      .get(rel.source)
      ?.push({ target: rel.target, weight: rel.weight });
  });

  let edgesCount = 0;
  const allWeights = relationships.map((r) => r.weight);
  // const maxWeight = Math.max(...allWeights);
  let maxWeight = 0;
  for (const weight of allWeights) {
    if (maxWeight < weight) {
      maxWeight = weight;
    }
  }
  // const minWeight = Math.min(...allWeights);
  graph.forEachNode((nodeId) => {
    const nodeRelations = relationsMap.get(nodeId) || [];

    // !!! ГОЛОВНА МАГІЯ !!!
    // Сортуємо зв'язки за силою і беремо тільки ТОП-5
    // Це перетворить "кашу" на структурний граф
    const topRelations = nodeRelations
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    topRelations.forEach((rel) => {
      // Нормалізація 0..1
      const normalizedWeight =
        Math.log(rel.weight + 1) / Math.log(maxWeight + 1);

      // Підносимо до квадрату або кубу! Це збільшує контраст.
      // Слабкий зв'язок (0.5) стане 0.25. Сильний (0.9) стане 0.81.
      // Це змусить кластери гуртуватися сильніше.
      let finalWeight = Math.pow(normalizedWeight, 2) * 10;

      if (finalWeight < 0.5) return; // Відкидаємо зовсім сміття
      // Перевіряємо, чи існує таргет і чи ще немає такого ребра (щоб не дублювати)
      if (graph.hasNode(rel.target) && !graph.hasEdge(nodeId, rel.target)) {
        graph.addEdge(nodeId, rel.target, { weight: finalWeight });
        edgesCount++;
      }
    });
  });

  console.log(`🔹 Додано ${edgesCount} оптимізованих ребер.`);

  // 4. Виявлення спільнот (Кластеризація для кольору)
  // Це автоматично додасть атрибут "community" кожному вузлу
  console.log("🔹 Розфарбовуємо кластери (Louvain)...");
  louvain.assign(graph);

  // Мапа кольорів для спільнот
  const COLORS = [
    // --- Червоні та Рожеві ---
    "#FF0000", // Яскраво-червоний (Red)
    "#800000", // Темно-бордовий (Maroon)
    "#FF69B4", // Яскраво-рожевий (HotPink)
    "#DC143C", // Малиновий (Crimson)
    "#FFC0CB", // Ніжно-рожевий (Pink)

    // --- Помаранчеві та Коричневі ---
    "#FF8C00", // Темно-помаранчевий (DarkOrange)
    "#FFD700", // Золотий (Gold)
    "#8B4513", // Коричневий (SaddleBrown)
    "#F4A460", // Пісочний (SandyBrown)
    "#FFDEAD", // Тілесний (NavajoWhite)

    // --- Жовті та Салатові ---
    "#FFFF00", // Яскраво-жовтий (Yellow)
    "#ADFF2F", // Жовто-зелений (GreenYellow)
    "#BDB76B", // Хакі (DarkKhaki)

    // --- Зелені ---
    "#008000", // Зелений (Green)
    "#00FF00", // Лайм (Lime)
    "#2E8B57", // Морська хвиля (SeaGreen)
    "#98FB98", // Блідо-зелений (PaleGreen)
    "#556B2F", // Оливковий (DarkOliveGreen)

    // --- Блакитні та Бірюзові ---
    "#00FFFF", // Ціан (Aqua)
    "#008080", // Тіл/Чирок (Teal)
    "#40E0D0", // Бірюзовий (Turquoise)
    "#4682B4", // Сталевий синій (SteelBlue)

    // --- Сині ---
    "#0000FF", // Синій (Blue)
    "#000080", // Темно-синій (Navy)
    "#8A2BE2", // Синьо-фіолетовий (BlueViolet)

    // --- Фіолетові ---
    "#800080", // Пурпурний (Purple)
    "#9932CC", // Темна орхідея (DarkOrchid)
    "#E6E6FA", // Лаванда (Lavender)

    // --- Нейтральні / Ахроматичні ---
    "#808080", // Сірий (Gray)
    "#2F4F4F", // Темний грифельний (DarkSlateGray)
  ];
  graph.forEachNode((node, attributes) => {
    const colorIndex = attributes.community % COLORS.length;
    graph.setNodeAttribute(node, "color", COLORS[colorIndex]);
  });

  // 2. Запуск 3D фізики
  console.log("🔹 Запуск 3D симуляції...");

  force.assign(graph, {
    maxIterations: 1000, // Треба більше ітерацій для 3D
    settings: {
      dimensions: 3, // <--- ГОЛОВНЕ: вмикаємо 3D режим

      // Налаштування сил (схожі на FA2, але трохи інші назви)
      attraction: 0.01, // Сила притягання (пружини)
      repulsion: 1, // Сила відштовхування
      gravity: 0.05, // Тяжіння до центру (0,0,0)
      inertia: 0.6, // Допомагає згладити рух
    } as any,
  });

  // 6. Експорт у JSON для фронтенду
  console.log("🔹 Зберігаємо результат...");
  // const output = graph.export(); // Експортує повний стан (з координатами x, y)

  const nodes = graph.mapNodes((key, attributes) => {
    return {
      id: key, // React-Force-Graph хоче 'id', а не 'key'
      ...attributes, // Розгортаємо attributes: x, y, z, color, label, size стануть властивостями першого рівня
    };
  });

  // 2. Формуємо масив зв'язків (links замість edges)
  const links = graph.mapEdges((_key, attributes, source, target) => {
    return {
      source: source,
      target: target,
      ...attributes, // Розгортаємо weight
    };
  });

  // 3. Формуємо фінальний об'єкт
  const finalData = { nodes, links };

  return finalData;
}
