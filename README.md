

# use-undo-reducer

> A tiny React hook for adding **undo/redo** to reducer-driven state, with support for **history limits**, **keybindings**, and **replay-based performance optimization**.

---

## ✨ Features

- 🧠 Familiar reducer-based pattern
- ⌨️ Configurable undo/redo keybindings
- 🧭 Deterministic time-travel via reducer replay
- 🚀 Performance-friendly state projections
- 🎛️ Supports history limits and callbacks

---

## 📦 Installation

```bash
npm install use-undo-reducer
```

or

```bash
yarn add use-undo-reducer
```

---

## 🧪 Quick Example

```tsx
import { useUndoRedoReducer } from 'use-undo-reducer';

type State = { count: number };
type Action = { type: 'inc' } | { type: 'dec' };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'inc': return { count: state.count + 1 };
    case 'dec': return { count: state.count - 1 };
    default: return state;
  }
};

function Counter() {
  const { state, dispatch, undo, redo } = useUndoRedoReducer(reducer, { count: 0 }, {
    keybinds: {
      undo: e => e.metaKey && !e.shiftKey && e.key === 'z',
      redo: e => (e.metaKey && e.shiftKey && e.key === 'z') || (e.ctrlKey && e.key === 'y'),
    },
    historyLimit: 50,
    onUndoFailed: () => alert('No more undos!'),
    onRedoFailed: () => alert('Nothing to redo!'),
  });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'dec' })}>-</button>
      <button onClick={() => dispatch({ type: 'inc' })}>+</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
    </div>
  );
}
```

---

## 🧠 Concept

This hook is designed for situations where state changes over time and you want to let the user undo or redo previous actions — like drawing tools, diagram editors, form builders, etc.

Instead of storing full snapshots of state, we store an **action history**, then **replay** the reducer from a base projection whenever the user undoes or redoes. This ensures:
- Minimal memory usage
- Deterministic behavior
- High compatibility with pure reducers

---

## 🧰 API

```ts
function useUndoRedoReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S,
  config?: {
    historyLimit?: number;
    keybinds?: {
      undo: (e: KeyboardEvent) => boolean;
      redo: (e: KeyboardEvent) => boolean;
    };
    onUndoFailed?: () => void;
    onRedoFailed?: () => void;
  }
): {
  state: S;
  dispatch: (action: A) => void;
  undo: () => void;
  redo: () => void;
}
```

### Parameters

| Name        | Type                                       | Description |
|-------------|--------------------------------------------|-------------|
| `reducer`   | `(state: S, action: A) => S`               | Your standard reducer function |
| `initialState` | `S`                                     | The initial state for your reducer |
| `config`    | *(optional)* object                        | Configuration object |

### Config Options

| Key              | Type                              | Default       | Description |
|------------------|-----------------------------------|---------------|-------------|
| `historyLimit`   | `number`                          | `100`         | Max number of actions to keep in history |
| `keybinds.undo`  | `(e: KeyboardEvent) => boolean`   | `undefined`   | Function that returns true if the keypress should trigger undo |
| `keybinds.redo`  | `(e: KeyboardEvent) => boolean`   | `undefined`   | Function that returns true if the keypress should trigger redo |
| `onUndoFailed`   | `() => void`                      | `undefined`   | Called when undo is not possible |
| `onRedoFailed`   | `() => void`                      | `undefined`   | Called when redo is not possible |

### Return Value

| Key        | Type                   | Description |
|------------|------------------------|-------------|
| `state`    | `S`                    | The current computed state |
| `dispatch` | `(action: A) => void`  | Dispatch a new action |
| `undo`     | `() => void`           | Undo the previous action |
| `redo`     | `() => void`           | Redo a previously undone action |

---

## 🎹 Custom Keybinds

You must provide keybinds as functions that return `true` if the event matches.

```ts
keybinds: {
  undo: e => e.metaKey && e.key === 'z' && !e.shiftKey,
  redo: e => e.metaKey && e.key === 'z' && e.shiftKey,
}
```

This gives you full control over how to handle platforms (Windows vs macOS), keyboard layouts, or app-specific shortcuts.

---

## 🚧 Limitations

- Your reducer must be pure. It must **not mutate state** or depend on external variables.
- This hook is not suitable for reducers that rely on **side effects** or **non-deterministic operations**.
- Currently there is no batching of actions (e.g. `group()` support) — this is a potential future feature.

---

## 📚 Use Cases

- Diagram/flowchart editors
- Form builders
- Drawing/canvas tools
- In-browser modeling tools
- Collaborative tools with local draft logic

---

## 🧱 Roadmap

- [ ] Action batching
- [ ] Devtools integration
- [ ] Snapshot + replay hybrid for heavy state
- [ ] Hook to observe history state (canUndo, canRedo, etc.)

---

## 🤝 Contributing

Pull requests, issues, and feedback are very welcome!  
This project was built with care to solve real-world complex undo/redo in React-based visual editors.

---

## 🪪 License

MIT © [Sam Apostel](https://sams.works)