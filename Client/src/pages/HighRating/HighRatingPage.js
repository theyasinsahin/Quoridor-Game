import { useLocation } from 'react-router-dom';

const HighRatingTablePage = () => {
    const location = useLocation();
    const { sortedUsers } = location.state || { sortedUsers: [] };

    return (
        <div>
            <h2>All User Ratings</h2>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Name</th>
                        <th>Rating</th>
                        <th>Country</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedUsers.map((user, index) => (
                        <tr key={user.id}>
                            <td>{index + 1}</td>
                            <td>{user.name}</td>
                            <td>{user.rating}</td>
                            <td>{user.country}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HighRatingTablePage;
