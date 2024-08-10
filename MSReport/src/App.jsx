import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { firebaseConfig } from './config';
import './App.css';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const WEB_APP_URL = '';

const App = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [data, setData] = useState([]);
    const [articles, setArticles] = useState([]);
    const [selectedArticle, setSelectedArticle] = useState('');
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const windowHeight = window.innerHeight;
            const appElement = document.querySelector('.app');
            if (appElement) {
                appElement.style.paddingBottom = `${windowHeight * 0.2}px`;
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUsername(user.email);
                setIsAuthenticated(true);
                fetchArticles();
            } else {
                setIsAuthenticated(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, username, password);
        } catch (error) {
            console.error('Error logging in:', error);
            alert('Invalid username or password');
        }
    };

    const fetchData = async () => {
        try {
            const q = query(collection(db, "reports"), where("username", "==", username));
            const querySnapshot = await getDocs(q);
            const userData = querySnapshot.docs.map(doc => doc.data())
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, 7);

            setData(userData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchArticles = async () => {
        try {
            const articlesCollection = collection(db, "articles");
            const articlesSnapshot = await getDocs(articlesCollection);
            const articlesList = articlesSnapshot.docs.map(doc => doc.data().title);
            setArticles(articlesList);
        } catch (error) {
            console.error('Error fetching articles:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        const date = new Date().toLocaleDateString();
        const timestamp = new Date().toISOString();
        const newRow = { username, date, amount, article: selectedArticle, timestamp };

        try {
            await addDoc(collection(db, "reports"), newRow);

            await fetch(WEB_APP_URL, {
                redirect: "follow",
                method: "POST",
                body: JSON.stringify(newRow),
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
            });

            setAmount('');
            setSelectedArticle('');

            fetchData();
        } catch (error) {
            console.error('Error submitting data:', error);
        } finally {
            setProcessing(false);
        }
    };

    const getAmountStyle = (amount) => {
        return { backgroundColor: amount >= 0 ? 'green' : 'red', color: 'white' };
    };

    const handleFocus = (e) => {
        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    return (
        <div className="app">
            {!isAuthenticated ? (
                <div className="login-container">
                    <div className="login-box">
                        <h1>MSR</h1>
                        <p>Добро пожаловать в <b>MSR</b>. Пожалуйста авторизуйтесь для подтверждения Вашего доходного отчета.</p>
                        <input
                            type="text"
                            placeholder="Логин"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onFocus={handleFocus}
                            className="input-field"
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={handleFocus}
                            className="input-field"
                        />
                        <button onClick={handleLogin} className="login-button">Войти</button>
                    </div>
                </div>
            ) : (
                <div className="data-container">
                    <form className="report-form" onSubmit={handleSubmit}>
                        <h3>Заполнить отчёт</h3>
                        <input
                            type="text"
                            placeholder="Сумма"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onFocus={handleFocus}
                            className="input-field"
                            required
                        />
                        <select
                            value={selectedArticle}
                            onChange={(e) => setSelectedArticle(e.target.value)}
                            onFocus={handleFocus}
                            className="input-field"
                            required
                        >
                            <option value="" disabled>Статья</option>
                            {articles.map((article, index) => (
                                <option key={index} value={article}>{article}</option>
                            ))}
                        </select>
                        <button className="submit-button" type="submit" disabled={processing}>Отправить</button>
                    </form>
                    {
                        data && data.length !== 0 ?
                            <div>
                                <h2>Отчёт за последние 7 дней</h2>
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Дата</th>
                                            <th>Сумма</th>
                                            <th>Справочник</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data && data.map((row, index) => (
                                            <tr key={index}>
                                                <td>{row.date}</td>
                                                <td style={getAmountStyle(Number(row.amount))}>{row.amount}</td>
                                                <td>{row.article}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div> : <div></div>
                    }
                </div>
            )}
        </div>
    );
};

export default App;
