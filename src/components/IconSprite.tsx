/**
 * Versteckte SVG-Sprite mit allen Icons (wie im Referenz-Design).
 * Wird einmal im Root-Layout gerendert; Komponenten nutzen <Icon name="..." />.
 */
export default function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <symbol id="ic-home" viewBox="0 0 24 24"><path d="M4 11l8-7 8 7" /><path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" /><path d="M10 20v-5h4v5" /></symbol>
      <symbol id="ic-chat" viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></symbol>
      <symbol id="ic-cam" viewBox="0 0 24 24"><path d="M4.5 8h2.2l1.2-2h8.2l1.2 2h2.2A1.8 1.8 0 0 1 21 9.8V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.8A1.8 1.8 0 0 1 4.5 8z" /><circle cx="12" cy="13.5" r="3.5" /></symbol>
      <symbol id="ic-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3 3 0 0 1 0 5.6" /><path d="M17 14.2A5.5 5.5 0 0 1 20.5 20" /></symbol>
      <symbol id="ic-book" viewBox="0 0 24 24"><path d="M12 6.4C10 5 7 4.6 4 5.1V18c3-.5 6-.1 8 1.3 2-1.4 5-1.8 8-1.3V5.1c-3-.5-6-.1-8 1.3z" /><path d="M12 6.4V19.3" /></symbol>
      <symbol id="ic-send" viewBox="0 0 24 24"><path d="M4 12l16-7-7 16-2.5-6.5L4 12z" /></symbol>
      <symbol id="ic-flame" viewBox="0 0 24 24"><path d="M12 2.5s5 4.2 5 9.2a5 5 0 0 1-10 0c0-2 1-3.6 2-4.6.5 1.3 1.4 1.9 2.1 2.1C11 7 11.5 4.6 12 2.5z" /></symbol>
      <symbol id="ic-bolt" viewBox="0 0 24 24"><path d="M13 2.5L4 14h6l-1 7.5L20 10h-6l1-7.5z" /></symbol>
      <symbol id="ic-grain" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="3" /></symbol>
      <symbol id="ic-drop" viewBox="0 0 24 24"><path d="M12 3.2s5.6 5.6 5.6 9.8a5.6 5.6 0 0 1-11.2 0c0-4.2 5.6-9.8 5.6-9.8z" /></symbol>
      <symbol id="ic-leaf" viewBox="0 0 24 24"><path d="M5 19c0-8 6-13 15-13 0 9-5 14-13 14" /><path d="M5 19c3-5 7-7.5 11-8.5" /></symbol>
      <symbol id="ic-carrot" viewBox="0 0 24 24"><path d="M3 21s2-9 8.5-9.5S21 5 21 5s-3.5 1-6 1" /><path d="M14 4c1.5 1.5 2 4 2 4M11 7c1.5 1 2.5 3 2.5 3" /></symbol>
      <symbol id="ic-body" viewBox="0 0 24 24"><circle cx="12" cy="4.8" r="2.3" /><path d="M12 7.1v6.4M12 9.4L8 11.6M12 9.4l4 2.2M12 13.5l-3.4 5.7M12 13.5l3.4 5.7" /></symbol>
      <symbol id="ic-scale" viewBox="0 0 24 24"><path d="M12 3.5v17M6.5 7h11M7 7l-3 6.2a3 3 0 0 0 6 0zM17 7l-3 6.2a3 3 0 0 0 6 0z" /><path d="M9 20.5h6" /></symbol>
      <symbol id="ic-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.6" /></symbol>
      <symbol id="ic-spark" viewBox="0 0 24 24"><path d="M12 2.5l2 5.6 5.6 2-5.6 2-2 5.6-2-5.6-5.6-2 5.6-2z" /></symbol>
      <symbol id="ic-shield" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></symbol>
      <symbol id="ic-check-c" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M8.4 12.2l2.6 2.6 4.6-5.2" /></symbol>
      <symbol id="ic-doc" viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></symbol>
      <symbol id="ic-chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" /></symbol>
      <symbol id="ic-bell" viewBox="0 0 24 24"><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20a2 2 0 0 0 4 0" /></symbol>
      <symbol id="ic-syringe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 8.2v7.6M8.2 12h7.6" /></symbol>
      <symbol id="ic-camai" viewBox="0 0 24 24"><path d="M3.5 9A2.3 2.3 0 0 1 5.8 6.7h1.6l.95-1.75a1.3 1.3 0 0 1 1.15-.7h3.1a1.3 1.3 0 0 1 1.15.7L14.6 6.7h1.6A2.3 2.3 0 0 1 18.5 9v7.8A2.3 2.3 0 0 1 16.2 19H5.8a2.3 2.3 0 0 1-2.3-2.2z" /><circle cx="11" cy="12.8" r="3.1" /></symbol>
      <symbol id="ic-mail" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.6" /><path d="M4 7.5l8 5.5 8-5.5" /></symbol>
      <symbol id="ic-lock" viewBox="0 0 24 24"><rect x="4.5" y="10.5" width="15" height="10" rx="2.6" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></symbol>
      <symbol id="ic-eye" viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></symbol>
      <symbol id="ic-logout" viewBox="0 0 24 24"><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 12h10M17 9l3 3-3 3" /></symbol>
      <symbol id="ic-dumbbell" viewBox="0 0 24 24"><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" /></symbol>
      <symbol id="ic-check2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5" /></symbol>
    </svg>
  );
}
