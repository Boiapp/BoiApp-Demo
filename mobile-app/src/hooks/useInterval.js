import { useCallback, useEffect, useRef, useState } from "react";

const isFunction = (functionToCheck) =>
  typeof functionToCheck === "function" &&
  !!functionToCheck.constructor &&
  !!functionToCheck.call &&
  !!functionToCheck.apply;

const defaultOptions = {
  cancelOnUnmount: true,
};

const useInterval = (fn, milliseconds, options = defaultOptions) => {
  const opts = { ...defaultOptions, ...(options || {}) };
  const timeout = useRef();
  const callback = useRef(fn);
  const [isCleared, setIsCleared] = useState(false);

  // método para limpiar el intervalo
  const clear = useCallback(() => {
    if (timeout.current) {
      setIsCleared(true);
      clearInterval(timeout.current);
    }
  }, []);

  // si la función proporcionada cambia, cambia su referencia
  useEffect(() => {
    if (isFunction(fn)) {
      callback.current = fn;
    }
  }, [fn]);

  // cuando cambien los milisegundos, reinicia el tiempo de espera
  useEffect(() => {
    if (typeof milliseconds === "number") {
      timeout.current = setInterval(() => {
        callback.current();
      }, milliseconds);
    }

    // limpia el intervalo anterior
    return clear;
  }, [milliseconds]);

  // cuando se desmonte el componente, elimina el intervalo
  useEffect(
    () => () => {
      if (opts.cancelOnUnmount) {
        clear();
      }
    },
    []
  );

  return [isCleared, clear];
};

export default useInterval;
