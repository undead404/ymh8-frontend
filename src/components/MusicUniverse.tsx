import ForceGraph3D from 'react-force-graph-3d';

import type { MusicUniverseGraph } from '../schemata';

// const LoadGraph = ({ graph: musicGraph }: { graph: MusicUniverseGraph }) => {
//   return null;
// };

export const MusicUniverse = ({ graph }: { graph: MusicUniverseGraph }) => {
  return (
    <ForceGraph3D
      graphData={graph}
      // Оскільки ми порахували координати на сервері,
      // ми можемо вимкнути двигун фізики на клієнті, щоб не гріти телефон,
      // АБО залишити його для "живого" ефекту.

      // Варіант А: Статичний (швидкий)
      // cooldownTicks={0} // Не рахувати фізику далі
      // Варіант Б: Живий (ефектний)
      cooldownTicks={100}
      nodeLabel="label"
      nodeColor={(node) => node.color}
      nodeVal={(node) => node.size} // Розмір
      // Візуальні налаштування
      backgroundColor="#000000"
      linkOpacity={0.2}
      nodeOpacity={0.9}
    />
  );
};
