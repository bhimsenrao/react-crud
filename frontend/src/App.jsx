import { useState } from 'react'

import AccountsCRUD1 from './components/AccountsCRUD1'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <AccountsCRUD1 />
    </>
  );
}

export default App
