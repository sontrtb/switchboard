import { useEffect, useRef, useState } from 'react';
import { Invitation, Inviter, Registerer, SessionState, UserAgent, UserAgentOptions, Web } from 'sip.js'

enum EStatus {
  INIT = 'init',
  REGISTED = 'registed',
  CALL = 'call'
}

// const aor = "sip:105@pbx.itel.dev";
// const authorizationUsername = '105';
// const authorizationPassword = 'NUk!85Gui1r2*QZWbyA$';

function App() {
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const localVideoVideoRef = useRef<HTMLVideoElement | null>(null)

  const sessionRef = useRef<Web.SessionDescriptionHandler>()
  const inviterRef = useRef<Inviter | Invitation>()

  const userAgentRef = useRef<UserAgent | null>(null)

  const [status, setStatus] = useState<EStatus>(EStatus.INIT)
  const [isAnonymous, setIsAnonymous] = useState(true)

  const [phone, setPhone] = useState("")
  const [valuesRegister, setValuesRegister] = useState({
    aor: "sip:105@pbx.itel.dev",
    authorizationUsername: "105",
    authorizationPassword: "NUk!85Gui1r2*QZWbyA$"
  })

  function onInvite(invitation: Invitation) {
    inviterRef.current = invitation
    console.log("cos ucoj goi", invitation)
    invitation.accept({
      sessionDescriptionHandlerOptions: {
        constraints: {
          audio: true,
          video: true
        }
      }
    })

    invitation.stateChange.addListener((newState) => {
      switch (newState) {
        case SessionState.Initial:
          break;
        case SessionState.Establishing:
          break;
        case SessionState.Established: {
          setStatus(EStatus.CALL)

          const sessionDescriptionHandler = invitation.sessionDescriptionHandler;

          if (!sessionDescriptionHandler || !(sessionDescriptionHandler instanceof Web.SessionDescriptionHandler)) {
            throw new Error("Invalid session description handler.");
          }

          sessionRef.current = sessionDescriptionHandler

          if (localVideoVideoRef.current) {
            assignStream(sessionDescriptionHandler.localMediaStream, localVideoVideoRef.current);
          }
          if (remoteVideoRef.current) {
            assignStream(sessionDescriptionHandler.remoteMediaStream, remoteVideoRef.current);
          }
          break;
        }
        case SessionState.Terminating:
        // fall through
        case SessionState.Terminated:
          cleanupMedia();
          break;
        default:
          throw new Error("Unknown session state.");
      }
    });
  }

  const register = async (isAnonymous: boolean) => {
    if (!remoteVideoRef.current || !localVideoVideoRef.current) return

    setIsAnonymous(isAnonymous)

    const uri = UserAgent.makeURI(isAnonymous ? "sip:anonymous@pbx.itel.dev" : valuesRegister.aor);

    const userAgentOptions: UserAgentOptions = {
      authorizationPassword: isAnonymous ? undefined : valuesRegister.authorizationPassword,
      authorizationUsername: isAnonymous ? undefined : valuesRegister.authorizationUsername,
      transportOptions: {
        server: isAnonymous ? "wss://pbx.itel.dev:8443" : "wss://pbx.itel.dev:7443"
      },
      uri,
      delegate: {
        onInvite,
      },
      displayName: isAnonymous ? 'Khách hàng ĐKTT' : valuesRegister.authorizationUsername,
      sessionDescriptionHandlerFactoryOptions: {
        constraints: {
          audio: true,
          video: true
        },
      },
    };
    const userAgent = new UserAgent(userAgentOptions);
    userAgentRef.current = userAgent

    const registerer = new Registerer(userAgent);

    userAgent.start().then(() => {
      registerer.register().then(() => {
        setStatus(EStatus.REGISTED)
      }).catch(() => {
        console.log("Sai....")
      });
    });
  }

  const unRegister = () => {

  }

  useEffect(() => {
    return () => unRegister()
  }, [])

  function cleanupMedia() {
    setStatus(EStatus.REGISTED)
    if (localVideoVideoRef.current) {
      localVideoVideoRef.current.srcObject = null;
      localVideoVideoRef.current?.pause();
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current?.pause();
    }
  }

  // Assign a MediaStream to an HTMLMediaElement and update if tracks change.
  function assignStream(stream: MediaStream, element: HTMLVideoElement): void {
    // Set element source.
    element.autoplay = true; // Safari does not allow calling .play() from a non user action
    element.srcObject = stream;

    // Load and start playback of media.
    element.play().catch((error: Error) => {
      console.error("Failed to play media");
      console.error(error);
    });

    // If a track is added, load and restart playback of media.
    stream.onaddtrack = (): void => {
      element.load(); // Safari does not work otheriwse
      element.play().catch((error: Error) => {
        console.error("Failed to play remote media on add track");
        console.error(error);
      });
    };

    // If a track is removed, load and restart playback of media.
    stream.onremovetrack = (): void => {
      element.load(); // Safari does not work otheriwse
      element.play().catch((error: Error) => {
        console.error("Failed to play remote media on remove track");
        console.error(error);
      });
    };
  }

  const handleCall = () => {
    const destinationCall = isAnonymous ? 'sip:1000@pbx.itel.dev' : `sip:${phone}@pbx.itel.dev`
    const target = UserAgent.makeURI(destinationCall);

    if (userAgentRef.current && target) {
      const inviter = new Inviter(userAgentRef.current, target, {
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: true,
            video: true
          },
        },
      });

      inviter.invite()
      inviterRef.current = inviter

      inviter.stateChange.addListener((newState) => {
        switch (newState) {
          case SessionState.Initial:
            break;
          case SessionState.Establishing:
            break;
          case SessionState.Established: {
            setStatus(EStatus.CALL)

            const sessionDescriptionHandler = inviter.sessionDescriptionHandler;

            if (!sessionDescriptionHandler || !(sessionDescriptionHandler instanceof Web.SessionDescriptionHandler)) {
              throw new Error("Invalid session description handler.");
            }

            sessionRef.current = sessionDescriptionHandler

            if (localVideoVideoRef.current) {
              assignStream(sessionDescriptionHandler.localMediaStream, localVideoVideoRef.current);
            }
            if (remoteVideoRef.current) {
              assignStream(sessionDescriptionHandler.remoteMediaStream, remoteVideoRef.current);
            }
            break;
          }
          case SessionState.Terminating:
          // fall through
          case SessionState.Terminated:
            cleanupMedia();
            break;
          default:
            throw new Error("Unknown session state.");
        }
      });
    }

  }

  const endCall = async () => {
    setStatus(EStatus.REGISTED)
    inviterRef.current?.bye()
  }

  return (
    <div className='p-5'>
      {/* register */}
      {

        status === EStatus.INIT &&
        <div>
          <h1 className="text-3xl font-bold underline text-orange-600">
            Có danh
          </h1>

          <br />

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Aor</label>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="sip:105@pbx.itel.dev"
              required
              onChange={e => {
                setValuesRegister(pre => ({ ...pre, aor: e.target.value }))
              }}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
            <input
              name='username'
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="105"
              required
              onChange={e => {
                setValuesRegister(pre => ({ ...pre, authorizationUsername: e.target.value }))
              }}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
            <input
              name='password'
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="password"
              required
              onChange={e => {
                setValuesRegister(pre => ({ ...pre, authorizationPassword: e.target.value }))
              }}
            />
          </div>
          <button
            type="button"
            className="py-2.5 px-5 me-2 mt-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={() => register(false)}
          >
            Đăng ký
          </button>

          <br />
          <br />
          <br />
          <h1 className="text-3xl font-bold underline text-orange-600">
            Ẩn danh
          </h1>
          <button
            type="button"
            className="py-2.5 px-5 me-2 mt-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={() => register(true)}
          >
            Đăng ký
          </button>
        </div>
      }

      {/* call on*/}
      <div style={{ display: status !== EStatus.CALL ? "none" : undefined }}>
        <video
          ref={remoteVideoRef}
          width="900"
          height="500"
          style={{ borderStyle: "solid" }}
        />
        <br />
        <video
          ref={localVideoVideoRef}
          width="320"
          height="200"
          style={{ borderStyle: "solid" }} />
      </div>

      {
        status === EStatus.REGISTED && !isAnonymous &&
        <div>
          <input
            type="text"
            placeholder='Phone'
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            onChange={e => {
              setPhone(e.target.value)
            }}
          />
        </div>
      }
      {
        status === EStatus.REGISTED &&
        <button
          type="button"
          className="py-2.5 px-5 me-2 mt-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          onClick={handleCall}
        >
          Gọi
        </button>
      }
      {
        status === EStatus.CALL &&
        <button
          type="button"
          className="py-2.5 px-5 me-2 mt-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          onClick={endCall}
        >
          Kết thúc
        </button>
      }
    </div>
  )
}

export default App
