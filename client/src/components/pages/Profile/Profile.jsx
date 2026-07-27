
import { UserProfile } from '../../UserProfile/UserProfile'
import { NavBar } from '../../navBar/NavBar';


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

