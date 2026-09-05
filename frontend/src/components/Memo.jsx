import { useState, useMemo } from "react";

function Memo() {

  const [number, setNumber] = useState(5);
  const [name, setName] = useState("");

  const square = useMemo(() => {

    console.log("Calculating square...");

    return number * number;

  }, [number]);

  return (
    <div>

      <h2>useMemo Example</h2>

      <input
        type="number"
        value={number}
        onChange={(e) => setNumber(Number(e.target.value))}
      />

      <h3>Square: {square}</h3>

      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <p>Hello {name}</p>

    </div>
  );
}

export default Memo;