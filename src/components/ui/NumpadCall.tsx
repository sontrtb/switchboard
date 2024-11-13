import { useState } from "react"
import Input from "./Input"
import Button from "./Button"

const arr = ["1", "2" , "3", "4", "5", "6", "7", "8", "9", ""]

interface INumpadCallProps {
    onCall: (number: string) => void
}

function NumpadCall(props: INumpadCallProps) {
    const {onCall} = props

    const [phone, setPhone] = useState("")

    return (
        <div>
            <Input label="Số điện thoại" onChangeText={setPhone}/>
            <Button onClick={() => onCall(phone)}>Gọi</Button>
        </div>
    )
}

export default NumpadCall