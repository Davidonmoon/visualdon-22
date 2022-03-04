const rectangles = document.querySelectorAll('.rectangle')

rectangles.forEach(rectangle => {
    rectangle.addEventListener('click', evt => {
        evt = evt.target;
        console.log(evt);
        rectangle.classList.toggle('Change')
    })
})

const donuts = document.querySelectorAll('.donut')

donuts.forEach(donut => {
    donut.addEventListener('mouseover', evt => {
        evt = evt.target;
        console.log(evt);
        /* donut.setAttribute("r","100") */
        donut.classList.toggle('changerayon')
    })
})