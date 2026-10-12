import './alert.css'

export default function Alert({message}) {
  return (
    <>
      <div className="alert">
        <div className="msg">{message}</div>
      </div>
    </>
  )
}
