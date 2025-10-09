import './Profile.css';

export const Profile = () => {
    const [profile, setProfile] = useState(null);
    useEffect(() => {
        const userID = localStorage.getItem("userID");

        fetch(``)
            .then((res) => res.json())
            .then((data) => setProfile(data))
            .catch((err) => console.error(err));
    },

    []);

    if(!profile){
        return <div className="front">Cargando perfil...</div>
    }
}

return (
    <div className='front'>
        <h2>{profile.name}</h2>
        <p>Email: {profile.email}</p>
    </div>
);
