describe('OTTO Product Add to Cart Verification', () => {

  beforeEach(() => {
    // Handaling screenshot and error messages on each fail.
    Cypress.on('fail', (error) => {
      cy.screenshot();
      throw error;
    });
  });

  it('should verify the product sorting filtering and adds product to the cart', () => {

    // visits the website
    cy.visit('https://www.otto.de/')

    // search for trampolin and sort the pricing to highest first
    cy.get('input[data-testid="squirrel-searchfield"]').type("trampolin")
    .should('have.value', 'trampolin')
    cy.get('div[data-testid="search-field-submit"]').click()
    cy.get('#heureka_desktopSorting--select--cloned').select('preis-absteigend')

    // waits for the products to get sorted
    cy.wait(2000);

    // Retrive the first five product prices
    const prices = []
    for (let i = 1; i <= 5; i++) {
      cy.get(`[data-qa="ftfind-roduct-${i}"]`)
        .find('.find_tile__priceContainer .find_tile__retailPrice')
        .invoke('text')
        .then((priceText) => {
          const price = parseFloat(priceText.trim().replace(',', '').replace('.', '').replace('€', ''));
          prices.push(price);
          cy.log(price)
        });
    }

    // Checks the products prices array is descending
    const isDescending = prices.every((price, index) => index === 0 || price <= prices[index - 1]);
    expect(isDescending).to.be.true;

    // Filter the products by price range
    cy.get('.pl_accordion__header:first').click()

    cy.get('#heureka_slider_1__minInput')
      .type('500')

    cy.get('#heureka_slider_1__minInput')
      .should('have.value', '500');

    cy.get('#heureka_slider_1__maxInput')
      .type('1000')

    cy.get('#heureka_slider_1__maxInput')
      .should('have.value', '1000')

    cy.get('.find_filter__select--range:not([disabled])').click({ force: true })

    // waits for the products to get filtered
    cy.wait(4000)

    // Store the product Id to verify later with the cart
    let productId;
    cy.get('article[data-product-id]')
    .eq(1)
    .invoke('attr', 'data-product-id')
    .then((id) => {
      productId = id; 
      cy.log('Product ID:', productId); 
    });

    cy.get('.find_tile__header').eq(1).click();

    // waits for to render the product page
    cy.wait(3000);

    // add the product to cart
    cy.get('[data-qa="addToBasket"]').click();

    // retrive frist product id from cart and checks with the productID
    cy.get('[data-pi]')
      .first() 
      .invoke('attr', 'data-pi')
      .then((productIdfromCart) => {
        cy.log('productId from Cart:', productIdfromCart); 
        expect(productIdfromCart).to.equal(productId); 
      });
  })
})