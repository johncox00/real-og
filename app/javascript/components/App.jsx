import React, { useState, useEffect } from "react";
import ActionCable from "actioncable";
const host = "localhost:3000";
const CableContext = React.createContext();
const cable = ActionCable.createConsumer(`ws://${host}/cable`);
function CableProvider({ children }) {
  return <CableContext.Provider value={cable}>{children}</CableContext.Provider>
}

const App = () => {
  const [url, setUrl] = useState("");
  const [previousUrls, setPreviousUrls] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [currentRequest, setCurrentRequest] = useState({});

  const fetchUrlPage = () => {
    fetch(`http://${host}/url_requests?page=${page}&per_page=10`).then((response) => {
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

  useEffect(() => {
    if (!currentRequest?.id) return;

    console.log("Setting up subscription for id", currentRequest.id);

    const subscription = cable.subscriptions.create(
      { channel: "UrlRequestUpdatesChannel", id: currentRequest.id },
      {
        connected: () => console.log("Connected for id", currentRequest.id),
        disconnected: () => console.log("Disconnected for id", currentRequest.id),
        received: (msg) => {
          console.log("Message received for id", currentRequest.id, msg);
          setCurrentRequest(prev => ({ ...prev, ...msg }));
        },
      }
    );

    return () => {
      console.log("Cleaning up subscription for id", currentRequest.id);
      subscription.unsubscribe();
    };
  }, [currentRequest?.id]);

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
      setPreviousUrls([ url, ...previousUrls ]);
      fetch(
        `http://${host}/url_requests`, 
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
        response.json().then((json) => {
          setCurrentRequest(json);
        });
      }).catch(err => console.error('ERROR!', err));
    }
  }

  return (
    <CableProvider>
      <form>
        <input onChange={urlChanged} value={url} />
        <button type="submit" onClick={submitUrl}>Search</button>
      </form>
      {
        currentRequest && 
        <div>
          <p>
            <strong>Status:</strong>
            <span>{currentRequest.status}</span>
          </p>
          {
            currentRequest.status === "success" && currentRequest.result &&
            <img src={currentRequest.result} width={300} />

          }
          {
            currentRequest.status == "error" &&
            <p>
              <strong>Error:</strong>
              <span>{currentRequest.result}</span>
            </p>
          }
        </div>
      }
      <ul>
        {
          previousUrls.map(u => <li key={u.id}>{u.url}</li>)
        }
      </ul>
      {
        more && <a onClick={() => setPage(page+1)}>fetch more</a>
      }
    </CableProvider>
    
  )
};

export default App;  
