document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');


});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  //Send mail
  document.querySelector('#submit').onclick = (event) => {
     event.preventDefault()
    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: document.querySelector('#compose-recipients').value,
            subject: document.querySelector('#compose-subject').value,
            body:  document.querySelector('#compose-body').value

        })
      })
      .then(response => response.json())
      .then(()=>{
              load_mailbox('sent');
      })
    }
}

function showMail(id, mailbox) {
              document.querySelector('#emails-view').style.display = 'none';
              document.querySelector('#email-content').style.display = 'block';
              document.querySelector('#compose-view').style.display = 'none';

              document.querySelector('#email-content').innerHTML = '';
              fetch(`/emails/${id}`)
                .then(response => response.json())
                .then(email => {
                        const showMail = document.createElement('div');
                        showMail.innerHTML =
                        `
                        <p><strong>From:</strong> ${email.sender}</p>
                        <p><strong>To:</strong> ${email.recipients}</p>
                        <p><strong>Subject:</strong> ${email.subject}</p>
                        <p><strong>Date:</strong> ${email.timestamp}</p>
                        <input type="submit" value="Reply" id="reply" class="btn btn-sm btn-outline-primary item">
                        <div id="archive" class="item"></div>
                        <hr>
                        <p>${email.body}</p>`;
                         document.querySelector('#email-content').append(showMail);

                         if (!email.read) {
                         fetch(`/emails/${email.id}`, {
                          method: 'PUT',
                          body: JSON.stringify({
                              read: true
                          })
                        })}
                         if (mailbox != 'sent')
                            {
                                 const archive = document.createElement("button");
                                 if(email.archived){
                                    archive.innerHTML = "Unarchive";
                                    archive.className = "btn btn-sm btn-outline-success ";}
                                 else{
                                     archive.innerHTML = "Archive";
                                     archive.className = "btn btn-sm btn-outline-danger ";}
                                 archive.addEventListener('click', function(){
                                     console.log("clicked")
                                     fetch(`/emails/${email.id}`, {
                                         method: 'PUT',
                                         body: JSON.stringify({
                                             archived: !email.archived
                                         })
                                      }).then(() => {
                                          load_mailbox('inbox')
                                     })
                                 })
                                 document.querySelector('#archive').append(archive);
                            }

                        document.querySelector('#reply').addEventListener('click',function (){
                            compose_email();
                            let subject = email.subject;
                            if (subject.split(' ',1)[0] != "Re:"){
                                subject = "Re: " + email.subject
                            }
                             document.querySelector('#compose-recipients').value = email.sender;
                             document.querySelector('#compose-subject').value = subject;
                             document.querySelector('#compose-body').value = "On Jan 1 2020, 12:00 AM foo@example.com wrote: " + email.body;

                        })
                });
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

        emails.forEach(email =>{
            const mailList = document.createElement('div');
            mailList.innerHTML =
            `<h6 class="item">${email.sender}</h6>
            <p class="item"> ${email.subject}</p>
            <p class="item date">${email.timestamp}</p>`;
            mailList.className = "list-group-item";

            if (email.read) {
                mailList.style.backgroundColor = '#D3D3D3'
            }
            else {
                 mailList.style.backgroundColor = 'white'
            }
            mailList.addEventListener('click', function() {
            showMail(email.id, mailbox) });
            document.querySelector('#emails-view').append(mailList);
        })
    });
}
