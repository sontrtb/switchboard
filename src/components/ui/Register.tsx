import { useState } from "react"
import Input from "./Input"
import Button from "./Button"

interface IRegisterProps {
    onCallAnonymous: () => void
    onLogin: (values: {authorizationUsername: string, authorizationPassword: string}) => void
}

function Register(props: IRegisterProps) {
    const {onCallAnonymous, onLogin} = props

    const [authorization, setAuthorixation] = useState({
        authorizationUsername: "",
        authorizationPassword: ""
    })

    const handleLogin = () => {
        onLogin(authorization)
    }

    return (
        <div className="w-96 p-6 m-5 border rounded-md">
            <Input
                label="Username"
                onChangeText={text => setAuthorixation(pre => ({...pre, authorizationUsername: text}))}
            />
             <Input
                label="Password"
                onChangeText={text => setAuthorixation(pre => ({...pre, authorizationPassword: text}))}
            />
            <Button onClick={handleLogin}>Đăng nhập</Button>

            <p className="text-center text-slate-400 text-sm">Hoặc</p>

            <Button onClick={onCallAnonymous}>Gọi ẩn danh</Button>
        </div>
    )
}

export default Register