import * as React from 'react';

import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 5;
const TOAST_REMOVE_DELAY = 1000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastState = {
  toasts: ToasterToast[];
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    toastStore.dispatch({
      type: 'REMOVE_TOAST',
      toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

type ToastAction =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string };

const toastReducer = (state: ToastState, action: ToastAction): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === action.toast.id ? { ...toast, ...action.toast } : toast
        ),
      };
    case 'DISMISS_TOAST': {
      const { toastId } = action;

      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => addToRemoveQueue(toast.id));
      }

      return {
        ...state,
        toasts: state.toasts.map((toast) =>
          toast.id === toastId || toastId === undefined
            ? { ...toast, open: false }
            : toast
        ),
      };
    }
    case 'REMOVE_TOAST': {
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }

      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.toastId),
      };
    }
    default:
      return state;
  }
};

const initialState: ToastState = {
  toasts: [],
};

type ToastStore = {
  state: ToastState;
  listeners: Set<React.Dispatch<React.SetStateAction<ToastState>>>;
  dispatch: (action: ToastAction) => void;
};

const toastStore: ToastStore = {
  state: initialState,
  listeners: new Set(),
  dispatch(action) {
    this.state = toastReducer(this.state, action);
    this.listeners.forEach((listener) => listener(this.state));
  },
};

const generateToastId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export const toast = ({ ...props }: Omit<ToasterToast, 'id'>) => {
  const id = generateToastId();

  const dismiss = () => toastStore.dispatch({ type: 'DISMISS_TOAST', toastId: id });
  const update = (toastProps: Partial<ToasterToast>) =>
    toastStore.dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...toastProps, id },
    });

  toastStore.dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          dismiss();
        }
      },
    },
  });

  return {
    id,
    dismiss,
    update,
  };
};

export const useToast = () => {
  const [state, setState] = React.useState<ToastState>(toastStore.state);

  React.useEffect(() => {
    toastStore.listeners.add(setState);
    return () => {
      toastStore.listeners.delete(setState);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) =>
      toastStore.dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
};
