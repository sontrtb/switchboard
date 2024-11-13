import { useState } from "react"
import Input from "./Input"
import Button from "./Button"

const arr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"]

interface INumpadCallProps {
    onCall: (number: string) => void
}

function NumpadCall(props: INumpadCallProps) {
    const { onCall } = props

    const [phone, setPhone] = useState("")

    const onClickPad = (a: string) => {
        setPhone(pre => pre + a)
    }

    return (
        <div>
            <Input label="Số điện thoại" onChangeText={setPhone} value={phone}/>
            <div className="grid grid-cols-3 gap-4">
                {
                    arr.map((a, index) => {
                        return (
                            <button
                                key={index}
                                onClick={() => onClickPad(a)}
                                className='h-14 w-14 bg-green-100 flex justify-center items-center rounded-full shadow-md cursor-pointer'
                            >
                                {a}
                            </button>
                        )
                    })
                }
            </div>
            <Button onClick={() => onCall(phone)}>Gọi</Button>
        </div>
    )
}

export default NumpadCall