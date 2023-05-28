import { useEffect } from "react";

export const useAsync = (
  asyncFn,
  successFunction,
  returnFunction,
  dependencies = []
) => {
  // metodo para ejecutar una función asíncrona
  // y ejecutar una función de éxito cuando se resuelva
  useEffect(() => {
    // variable para saber si el componente está montado
    let isActive = true;

    // ejecuta la función asíncrona y ejecuta la función de éxito
    asyncFn().then((result) => {
      if (isActive) successFunction(result);
    });

    // y si se desmonta el componente, cancela la ejecución
    return () => {
      returnFunction && returnFunction();
      isActive = false;
    };
  }, dependencies);
};
