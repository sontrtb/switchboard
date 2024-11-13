import { Invitation, Inviter, Registerer, SessionState, UserAgent, UserAgentOptions, Web } from "sip.js";
import ControllerVideo from "./components/ui/ControllerVideo";
import IncomingCall from "./components/ui/IncomingCall";
import Register from "./components/ui/Register";
import Video from "./components/ui/Video";
import { useRef, useState } from "react";
import NumpadCall from "./components/ui/NumpadCall";
import assignStream from "./action/assignStream";

enum EStatus {
  INIT = 'init',
  REGISTED = 'registed',
  CALL = 'call'
}

// // const authorizationUsername = '105';
// // const authorizationPassword = 'NUk!85Gui1r2*QZWbyA$';

function App() {
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null)
  const localVideoVideoRef = useRef<HTMLVideoElement | null>(null)

  const sessionRef = useRef<Web.SessionDescriptionHandler>()
  const inviterRef = useRef<Inviter | Invitation>()

  const userAgentRef = useRef<UserAgent | null>(null)

  const [status, setStatus] = useState<EStatus>(EStatus.INIT)
  const [incomingCall, setIncomingCall] = useState({
    isShow: false,
    phone: ""
  })

  function onInvite(invitation: Invitation) {
    setIncomingCall({
      isShow: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      phone: (invitation as any ).incomingInviteRequest.earlyDialog.dialogState.remoteURI.normal.user
    })

    invitation.stateChange.addListener((newState) => {
      switch (newState) {
        case SessionState.Initial:
          break;
        case SessionState.Establishing:
          console.log("SessionState Establishing")
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
          cleanupMedia(false);
          break;
        default:
          throw new Error("Unknown session state.");
      }
    });

    inviterRef.current = invitation
  }

  const cleanupMedia = (isAnonymous: boolean) => {
    setStatus(isAnonymous ?  EStatus.INIT : EStatus.REGISTED)
    if (localVideoVideoRef.current) {
      localVideoVideoRef.current.srcObject = null;
      localVideoVideoRef.current?.pause();
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      remoteVideoRef.current?.pause();
    }
  }

  const handleCall = (isAnonymous: boolean, phone?: string) => {
    const destinationCall = !phone ? 'sip:1000@pbx.itel.dev' : `sip:${phone}@pbx.itel.dev`
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
            console.log("Initial")
            break;
          case SessionState.Establishing:
            console.log("Establishing")
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
            console.log("Terminating")
            break
          case SessionState.Terminated:
            cleanupMedia(isAnonymous);
            break;
          default:
            throw new Error("Unknown session state.");
        }
      });
    }
  }

  const onCallAnonymous = () => {
    const uri = UserAgent.makeURI("sip:anonymous@pbx.itel.dev");
    const userAgentOptions: UserAgentOptions = {
      transportOptions: {
        server: "wss://pbx.itel.dev:8443"
      },
      uri,
      delegate: {
        onInvite,
      },
      displayName: 'Khách hàng ĐKTT',
      sessionDescriptionHandlerFactoryOptions: {
        constraints: {
          audio: true,
          video: true
        },
      },
    };
    const userAgent = new UserAgent(userAgentOptions);
    userAgentRef.current = userAgent

    userAgent.start().then(() => {
      handleCall(true)
    });
  }

  const endCall = async () => {
    inviterRef.current?.bye()
  }

  const onLogin = (values: {
    authorizationUsername: string;
    authorizationPassword: string;
  }) => {
    const uri = UserAgent.makeURI(`sip:${values.authorizationUsername}@pbx.itel.dev`);

    const userAgentOptions: UserAgentOptions = {
      authorizationPassword: values.authorizationPassword,
      authorizationUsername: values.authorizationUsername,
      transportOptions: {
        server: "wss://pbx.itel.dev:7443"
      },
      uri,
      delegate: {
        onInvite,
      },
      displayName: values.authorizationUsername,
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
      });
    });
  }

  const onCall = (phone: string) => {
    handleCall(false , phone)
  }

  return (
    <div className="flex justify-center items-center">
      <IncomingCall
        isShow={incomingCall.isShow}
        phone={incomingCall.phone}
        onAccept={() => {
          setIncomingCall({
            isShow: false,
            phone: ""
          });
          (inviterRef.current as Invitation)?.accept({
            sessionDescriptionHandlerOptions: {
              constraints: {
                audio: true,
                video: true
              }
            }
          })
        }}
        onReject={() => {
          setIncomingCall({
            isShow: false,
            phone: ""
          });
          (inviterRef.current as Invitation)?.reject();
          inviterRef.current = undefined
        }}
      />

      <div
        className={`relative h-screen flex justify-center items-center ${status === EStatus.CALL ? "block" : "hidden"}`}
      >
        <Video
          ref={remoteVideoRef}
        />
        <Video
          isMe
          className="absolute top-3 right-3"
          ref={localVideoVideoRef}
        />
        <ControllerVideo
          endCall={endCall}
        />
      </div>
      {
        status === EStatus.REGISTED &&
        <NumpadCall onCall={onCall} />
      }
      {
        status === EStatus.INIT &&
        <Register onCallAnonymous={onCallAnonymous} onLogin={onLogin} />
      }
    </div>
  )
}

export default App