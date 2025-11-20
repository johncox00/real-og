import React, { useState } from "react";

const App = () => {
  const [url, setUrl] = useState("");

  const urlChanged = (event) => {
    setUrl(event.target.value);
  }

  const submitUrl = (e) => {
    e.preventDefault();
    console.log(url);
  }

  return (
    <>
      <form>
        <input onChange={urlChanged} value={url} />
        <button type="submit" onClick={submitUrl}>Search</button>
      </form>

    </>
    
  )
};

export default App;  
