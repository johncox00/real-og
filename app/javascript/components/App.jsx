import React, { useState, useEffect } from "react";

const App = () => {
  const [url, setUrl] = useState("");
  const [previousUrls, setPreviousUrls] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);

  const fetchUrlPage = () => {
    fetch(`http://localhost:3000/url_requests?page=${page}&per_page=10`).then((response) => {
      response.json().then((json) => {
        setPreviousUrls([ ...previousUrls, ...json.data ]);
        setMore(json.total_pages > page);
      })
    })
  };

  useEffect(() => {
    fetchUrlPage();
  }, []);

  useEffect(() => {
    fetchUrlPage();
  }, [page]);

  const urlChanged = (event) => {
    setUrl(event.target.value);
  }

  const validateUrl = (url) => {
    return true;
  }

  const submitUrl = (e) => {
    e.preventDefault();
    console.log('ABOUT TO REQUEST: ', url);
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    if ( validateUrl(url) ) {
      fetch(
        'http://localhost:3000/url_requests', 
        { 
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          }, 
          body: JSON.stringify(
            { url_request: { url } },
          ),
        },
      ).then((response) => {
        response.json().then(json => console.log('SUCCESS!', json))
      }).catch(err => console.error('ERROR!', err));
    }
  }

  return (
    <>
      <form>
        <input onChange={urlChanged} value={url} />
        <button type="submit" onClick={submitUrl}>Search</button>
      </form>
      <ul>
        {
          previousUrls.map(u => <li key={u.id}>{u.url}</li>)
        }
      </ul>
      {
        more && <a onClick={() => setPage(page+1)}>fetch more</a>
      }
    </>
    
  )
};

export default App;  
