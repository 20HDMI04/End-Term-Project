 import { Navigate, useNavigate } from "react-router-dom";

export function Home(){
    const navigate = useNavigate();
    return (
        <div>
            <header>
                <h1>Explore the World of <br/>Books</h1>
                <h3>Dive into our collection of bestsellers and compelling reads</h3>
                <button 
                className="btn-primary"
                onClick={() => navigate("/discover")}
                >Browse Books</button>
            </header>
            
            <div>
                {/*Popular Books*/} 
            </div>

            <div>
                {/*Explore genres*/}
            </div>

            <div>
                {/*Popular Authors*/}
            </div>

            <footer>
                {/*Logo*/}
                <p>
                    "Jani ajánlásával lorem ipsum stb"
                </p>
                {/*contacts*/}
            </footer>

        </div>
    );
}