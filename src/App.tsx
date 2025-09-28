import "./App.css";
import Splotches from "./components/Splotches.tsx";

function App() {
  return (
    <div className="flex justify-center">
      <div className="w-4/5">
      <h1 className={"text-4xl font-bold"}>Splotches of Color</h1>
      <h2 className={"text-2xl"}>Northbound</h2>
      <Splotches direction={"N"} />

      <h2 className={"text-2xl"}>Southbound</h2>
      <Splotches direction={"S"} />
      </div>
    </div>
  );
}

export default App;
