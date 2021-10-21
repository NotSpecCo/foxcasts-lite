// import { useEffect, useState } from 'preact/hooks';
// import { setSelected } from '../utils/navigation';
// import { SelectablePriority, useDpad } from './useDpad';

// type Props = {
//   priority: SelectablePriority;
//   initialSelectedId?: string;
//   capture?: boolean;
// };
// export function useNavigation(props: Props) {
//   const [selectedId, setSelectedId] = useState<string>();

//   useEffect(() => {
//     console.log('useNav eff', props.initialSelectedId);

//     if (!props.initialSelectedId) return;
//     setSelected(props.initialSelectedId, true);
//     setSelectedId(props.initialSelectedId);
//   }, []);

//   useEffect(() => {
//     document.addEventListener('keydown', handleKeyPress, options.capture);

//     return (): void => {
//       document.removeEventListener('keydown', handleKeyPress, options.capture);
//     };
//   }, []);

//   useDpad({
//     priority: props.priority,
//     onChange: (itemId) => {
//       console.log('usedpad', itemId);
//       setSelectedId(itemId);
//     },
//   });

//   return { selectedId };
// }
