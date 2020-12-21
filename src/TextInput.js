import React, { useState } from 'react';

const TextInput = (props) => {  
    const [inputText, setInputText] = useState("")

    function sendFromInput(data){
        props.send(data)                      //general send
        props.tcpSendString(data)             //send over TCP
        setInputText("")                //clear input box
    }

    function clearConsole(){
        props.setConsoleText("")
    }

    function handleChange(e) {
        e.preventDefault() 
        const {name,value} = e.target

        if (name === 'sendButton'){
            sendFromInput(inputText)
            console.log(`handleChange: ${name}  ${inputText}`);
        } else {
            console.log(`handleChange: ${name}  ${value}`);
        }

    }

    function handleKeyPress (e){        
        e.preventDefault() 
        const {key} = e

        if(key !== 'Enter'){
            setInputText((prevText) => prevText + key)
        }
    }

    function handleKeyUp(e) {
        e.preventDefault() 
        const {key} = e
        if (key === "Backspace"){
            setInputText((prevText) => {
                if(prevText !== "" && prevText.length > 1){
                    return prevText.slice(0,-1)
                }
                return ""
            })
            return
        }

        if (key === "Enter") {
            sendFromInput(inputText)
        }
      }
        
    function handleSubmit(e) {
        e.preventDefault() 
    }

    return (
    <div className="input-box">
        <form onSubmit={handleSubmit}>
            <input 
                type="text" 
                value={inputText} 
                name="inputText" 
                className="input is-primary is-text-input is-small"
                autoComplete={"off"}
                placeholder=">" 
                onKeyPress={handleKeyPress}
                onKeyUp={handleKeyUp}
                onChange={handleChange} 
            />
        </form>

        <button 
                className="button is-info is-small"
                name="sendButton" 
                onClick={handleChange}
            >
            Send
        </button>
        <button 
                className="button is-info is-small"
                onClick={clearConsole}
            >
            Clear
        </button>
    </div>
    )
}
 
export default TextInput;