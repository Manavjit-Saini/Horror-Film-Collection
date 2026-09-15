/* We start by loading and parsing our JSON data, with fetch.
Read about fetch here: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch */

fetch('shoes.json')
.then(data => data.json() )  /* on this line we parse the file as JSON */
.then(json => { 

  console.log(json)

  // JavaScript can select elements on the page and store them in variables
  // Let's make a variable to hold the body element
  // see also: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
  let body = document.querySelector('body')

  // Javascript can create new elements to add to the page.
  // Let's add a logo dynamically, using the image src specified in our JSON data
  let logo = document.createElement('img')
  logo.src = json.logo
  logo.classList.add('logo')  /* here Javascript adds the 'logo' css class   */
  body.appendChild(logo)  /* here we are adding the newly created heading to the page */
  
  // Now let's embed a title in our page dynamically 
  // Here we create an h1 element and put JSON  data inside.
  let title = document.createElement('h1')
  title.innerHTML = json.title
  body.appendChild(title)  /* here we are adding the newly created heading to the page */

  // get a subtitle from the JSON data and add it to the page 
  let subtitle = document.createElement('p')
  subtitle.innerHTML = json.subtitle
  body.appendChild(subtitle)

  // let's make a shoe section on the page to hold all the shoes.
  let section = document.createElement('section')
  body.appendChild(section)

  // "forEach" lets us iterate over each shoe in our JSON data .
  // for each shoe, we build a template and add it to the page. 
  json.shoes.forEach( shoe => {
    
    // Let's create a div to contain the shoe
    let div = document.createElement('div')
    // add a CSS class "shoe" to each div
    div.classList.add('shoe')
    // set the CSS background based on our JSON data
    div.style.background = shoe.background
    
    // The template string below uses `backticks` instead of "quotes".
    // This allows us to embed variables inside the string
    // This is known as a "template literal"
    // see also: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals 
    let template = 
      `<h4>${shoe.name}</h4>
      <hr/>
      <p>${shoe.description}</p>`

    // place the template inside the shoe div
    div.innerHTML = template
    // add the  template to the shoe section
    document.querySelector('section').appendChild(div)
  })

  let footer = document.createElement('footer')
  footer.innerHTML = json.footer
  body.appendChild(footer)
  
})


