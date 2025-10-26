
import { UserProfile } from '../../UserProfile/UserProfile'
import { NavBar } from '../../NavBar/NavBar';


export const Profile = () => 
{
    return (

        <div className="NavBar">

            <NavBar />

            <section className="Profile">

                <UserProfile />

            </section>

        </div>

    )

}

