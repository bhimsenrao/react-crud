import { useState } from 'react'

import AccountsCRUD3 from './components/AccountsCRUD3'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <AccountsCRUD3 />
    </>
  );
}

export default App
