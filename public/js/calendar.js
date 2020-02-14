if (document.getElementById('calendar')) {
  document.addEventListener('DOMContentLoaded', async () => {
    const path = window.location.pathname;
    const data = await fetch(`${path}/calendar`);
    const result = await data.json();
    console.log(result);

    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: ['interaction', 'dayGrid', 'timeGrid', 'list'],
      defaultView: 'dayGridMonth',
      defaultDate: new Date(),
      lang: 'ru',
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek,interaction',
      },
      events: data,
      // dateClick(info) {
      //   // change the day's background color just for fun
      //   info.dayEl.style.backgroundColor = 'red';
      // },
    });

    calendar.render();
  });
}
