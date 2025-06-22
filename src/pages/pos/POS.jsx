import { Link } from "react-router-dom";

export default function Pos() {
    return (
        <div>
        <h1 style={{height: "1200px"}}>
            <p>POS</p>
            <Link to="/sales">돌아가기 (임시)</Link>
        </h1>
        </div>
    );
}