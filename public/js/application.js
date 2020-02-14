if (document.querySelector('.deleteUser')) {
  document.querySelector('.deleteUser').addEventListener('submit', async () => {
    event.preventDefault();
    const deletedUser = event.target.deletedUser.value;
    const response = await fetch ('/main/deleteUser', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deletedUser }),
    });
    document.querySelector('main').innerHTML += `<p>Пользователь и почтой ${deletedUser} удален</p>`;
  });
}
