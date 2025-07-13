import { useCallback, useEffect, useRef, useState } from "react";

type Config = {
	historyLimit?: number;
	keybinds?: {
		undo: (e: KeyboardEvent) => boolean;
		redo: (e: KeyboardEvent) => boolean;
	};
	onUndoFailed?: () => void;
	onRedoFailed?: () => void;
};

export function useUndoReducer<S, A>(
	reducer: (state: S, action: A) => S,
	initialState: S,
	config: Config = {},
): {
	state: S;
	dispatch: (action: A) => void;
	undo: () => void;
	redo: () => void;
} {
	const { historyLimit = 100, keybinds, onUndoFailed, onRedoFailed } = config;

	const [state, setState] = useState(initialState);
	const historyRef = useRef<A[]>([]);
	const indexRef = useRef<number>(-1);
	const baseStateRef = useRef<S>(initialState);
	const currentProjectionRef = useRef<S>(initialState);

	const dispatch = (action: A) => {
		const currentHistory = historyRef.current;
		const currentIndex = indexRef.current;

		const newHistory = currentHistory.slice(0, currentIndex + 1);
		newHistory.push(action);

		if (newHistory.length > historyLimit) {
			newHistory.shift();
			const oldestAction = currentHistory[0];
			if (oldestAction) {
				baseStateRef.current = reducer(baseStateRef.current, oldestAction);
			}
		}

		historyRef.current = newHistory;
		indexRef.current = newHistory.length - 1;

		currentProjectionRef.current = reducer(
			currentProjectionRef.current,
			action,
		);
		setState(currentProjectionRef.current);
	};

	const replay = useCallback(() => {
		const newState = historyRef.current
			.slice(0, indexRef.current)
			.reduce((state, action) => {
				return reducer(state, action);
			}, baseStateRef.current);

		currentProjectionRef.current = newState;
		setState(newState);
	}, [reducer]);

	const undo = useCallback(() => {
		if (indexRef.current < 0) {
			onUndoFailed?.();
			return;
		}

		indexRef.current--;
		replay();
	}, [onUndoFailed, replay]);

	const redo = useCallback(() => {
		if (indexRef.current >= historyRef.current.length - 1) {
			onRedoFailed?.();
			return;
		}

		indexRef.current++;
		replay();
	}, [onRedoFailed, replay]);

	useEffect(() => {
		if (!keybinds) return;

		const abortController = new AbortController();

		window.addEventListener(
			"keydown",
			(e: KeyboardEvent) => {
				if (keybinds.undo?.(e)) {
					e.preventDefault();
					undo();
				} else if (keybinds.redo?.(e)) {
					e.preventDefault();
					redo();
				}
			},
			{ signal: abortController.signal },
		);
		return () => abortController.abort();
	}, [keybinds, redo, undo]);

	return { state, dispatch, undo, redo };
}
