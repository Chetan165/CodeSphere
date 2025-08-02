import toast from 'react-hot-toast';

const UserAuth = async (setUser) => {
    try {
      const findUser = await fetch('http://localhost:3000/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
      });
      const response = await findUser.json();
      if (response && response.uid) {
        console.log('User found with uid :', response.uid);
        setUser(response);
      } else {
        toast.error("Not authorized to access, please login first");
        setTimeout(()=>window.location.href = '/',1000); // Redirect to home if no user found
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    };
}

export default UserAuth