import logo from './strato.svg';
import './App.css';
import UserTable from './newTable.jsx';

function App() {
  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      <h1>Strato</h1>
      <UserTable/>
    </div>
  );
}

export default App;
