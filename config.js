/* ==========================================================================
   LEVIATHAN — configuration
   Edit this one file. Nothing else needs to change.
   ========================================================================== */

window.LEVIATHAN_CONFIG = {

  /* Your personal email. Every grievance submitted on the site is sent here. */
  heroEmail: "abhishekvnair2007@gmail.com",

  /* How the email is delivered.
     "formsubmit" — no signup, no backend, works on any static host.
                    First submission triggers a one-time activation email
                    from FormSubmit; click the link in it once and you're live.
     "emailjs"    — use if you already have an EmailJS account (fill in the
                    three ids below).
     "none"       — skip sending; the chat still works and logs to console.  */
  transport: "formsubmit",

  /* Only needed when transport is "emailjs" */
  emailjs: {
    publicKey:  "",
    serviceId:  "",
    templateId: ""
  },

  /* Subject line of the notification email */
  subject: "🌊 Someone needs Leviathan's help",

  /* Show the chat automatically this many ms after entering the site.
     Set to 0 to disable auto-open. */
  autoOpenDelay: 4200
};
