import React, { useState, useEffect } from "react";
import ActionCable from "actioncable";
import PreviewCard from "./PreviewCard";
import StatusPill from "./StatusPill";
import EmptyState from "./EmptyState";

const host = "localhost:3000";
const CableContext = React.createContext();
const cable = ActionCable.createConsumer(`ws://${host}/cable`);
function CableProvider({ children }) {
  return <CableContext.Provider value={cable}>{children}</CableContext.Provider>
}

function ensureHttps(urlString) {
  if (!urlString || typeof urlString !== "string") return null;

  const hasProtocol = /^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(urlString);

  try {
    // If it has a protocol, validate directly
    if (hasProtocol) {
      return new URL(urlString).toString();
    }

    // Try prepending https://
    return new URL("https://" + urlString).toString();
  } catch {
    return null; // Not a valid URL even after prepending
  }
}

const App = () => {
  const [url, setUrl] = useState("");
  const [previousUrls, setPreviousUrls] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentRequest, setCurrentRequest] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invalid, setInvalid] = useState(false);

  const fetchUrlPage = () => {
    fetch(`http://${host}/url_requests?page=${page}&per_page=10`).then((response) => {
      response.json().then((json) => {
        setPreviousUrls([ ...previousUrls, ...json.data ]);
        setMore(json.total_pages > page);
        setTotalCount(json.total);
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
    setInvalid(false);
    try {
      const u = new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  const submitUrl = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('ABOUT TO REQUEST: ', url);
    const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content");
    const urlToSubmit = ensureHttps(url);
    if ( validateUrl(urlToSubmit) ) {
      
      fetch(
        `http://${host}/url_requests`, 
        { 
          method: 'POST', 
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
          }, 
          body: JSON.stringify(
            { url_request: { url: urlToSubmit } },
          ),
        },
      ).then((response) => {
        response.json().then((json) => {
          setCurrentRequest(json);
          setPreviousUrls([ json, ...previousUrls ]);
        });
      }).catch(err => console.error('ERROR!', err)).finally(() => {
        setIsSubmitting(false);
        setUrl(urlToSubmit);
    });
    } else {
      setInvalid(true);
      setIsSubmitting(false);
    }
  }

  return (
    <CableProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
          {/* Header */}
          <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Open Graph Previewer
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                Enter any URL to fetch its Open Graph image and preview how it will
                look when shared on social platforms. History is persisted and
                shown below.
              </p>
            </div>
            <span className="inline-flex items-center self-start rounded-full bg-slate-900 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-50">
              Luna Take-Home
            </span>
          </header>

          <main className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            {/* Left column: form + preview */}
            <section className="flex flex-col gap-4">
              {/* URL Form */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                <form className="space-y-3">
                  <label
                    htmlFor="url"
                    className="block text-sm font-medium text-slate-800"
                  >
                    Test a URL
                  </label>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input 
                      onChange={urlChanged} 
                      value={url}
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                    />
                    <button
                      type="submit"
                      onClick={submitUrl}
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-50 shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {isSubmitting ? "Submitting..." : "Fetch preview"}
                    </button>
                  </div>
                  {
                    invalid ? 
                    (
                      <p className="text-xs text-red-500">
                        INVALID URL
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">
                        We'll fetch the page asynchronously, look for{" "}
                        <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px]">
                          og:image
                        </code>{" "}
                        tags, and update the preview when it's ready.
                      </p>
                    )
                  }
                  
                </form>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Latest preview
                    </h2>
                  </div>
                </div>

                {!currentRequest.id ? (
                  <EmptyState />
                ) : (
                  <>
                    <StatusPill status={currentRequest.status} />
                    <PreviewCard request={currentRequest} />
                  </>
                  
                )}
              </div>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  History
                </h2>
                <span className="text-xs text-slate-500">
                  {previousUrls.length} / {totalCount} URL{totalCount === 1 ? "" : "s"}
                </span>
              </div>

              {previousUrls.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  <p className="max-w-xs text-center text-xs text-slate-500">
                    No URLs yet. Submit a URL on the left to see it appear here
                    with live status updates.
                  </p>
                </div>
              ) : (
                <>
                  <ul className="flex max-h-[450px] flex-col gap-2 overflow-y-auto pr-1 text-sm">
                    {previousUrls.map((req) => (
                      <li key={req.id}>
                        {req.url}
                      </li>
                    ))}
                  </ul>
                  {
                    more && ( 
                    <button
                      onClick={() => setPage(page+1)}
                      className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Load more
                    </button>
                  )}
                </>
              )}
            </section>
          </main>
        </div>
      </div>
    </CableProvider>
    
  )
};

export default App;  
