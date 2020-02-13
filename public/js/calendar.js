if (document.getElementById("calendar")) {
  document.addEventListener("DOMContentLoaded", async function() {
    const path = window.location.pathname;
    const data = await fetch(`${path}/calendar`);
    const result = await data.json();
    console.log(result);

    const calendarEl = document.getElementById("calendar");

    const calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: ["interaction", "dayGrid", "timeGrid", "list"],
      defaultView: "dayGridMonth",
      defaultDate: new Date(),
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      events: data,
    });

    calendar.render();
  });
}

