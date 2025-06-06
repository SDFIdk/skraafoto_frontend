import svgSprites from '@dataforsyningen/designsystem/assets/icons.svg'

export class InformationDialog extends HTMLElement {

  dialogElement
  template = `
    <button class="secondary" aria-controls="info-dialog" title="Information om Skråfoto" style="border: none;">
      <svg><use href="${ svgSprites }#question"></svg>
    </button>

    <dialog id="info-dialog">
      <header style="padding: var(--space) var(--space-lg) var(--space);">
        <h2 tabindex="0">Information om Skråfoto</h2>
        <button class="quiet" aria-controls="info-dialog" title="Luk dialogboks">
          <svg><use href="${ svgSprites }#close"></svg>
        </button>
      </header>
      <article style="padding: 0;">

        <div style="padding: var(--space) var(--space-lg) var(--space-lg);">

          <p>
            Skråfoto er en webapplikation, som stilles til rådighed af Klimadatastyrelsen.<br>
            Den kan benyttes til at finde og vise skråfotos fra hele Danmark i 2017, 2019, 2021 og 2023.
          </p>
          
          <h3>Vilkår og betingelser</h3>
          <p>Brug af Skråfoto er omfattet af <a href="https://dataforsyningen.dk/Vilkaar">Dataforsyningens vilkår og betingelser.</a></p>

          <h4 class="h4">Om afstands- og højdemåling i skråfotos</h4>
          <p>
            Da målingen af afstand og højde fortages i et fladt foto på en jordoverflade, der er krum og afhængig af terrænet, er det vigtig, at målingen altid foretages på jorden. Ellers vil målingen være misvisende.<br>
            I skråfotoviseren anvendes Danmarks Højdemodel til at beregne den korrekte placering. Hvis man starter oppe over terræn vil målingen blive forkert.
          </p>
          
          <h3>Support</h3>
          <p>
            <strong>Telefon: 78 76 87 92</strong><br>
            Har du brug for hjælp? Ring til supporten, vi har åbent mandag til torsdag kl. 09:00-14:00, og fredag kl. 10:00-14:00.
          </p>
          <p>
            <strong>E-mail: support@kds.dk</strong><br>
            Har du spørgsmål eller ændringsforslag til Dataforsyningen? Skriv til supporten. Vi vender tilbage til dig hurtigst muligt. 
          </p>
          
          <h3>Tilgængelighed</h3>
          <p>Tilgængeligheden på dette websted er omfattet af <a href="https://was.digst.dk/dataforsyningen-dk">Dataforsyningens tilgængelighedserklæring.</a></p>
          
          <h3>Open source</h3>
          <p>Skråfoto webapplikationens kode er open source og stilles til rådighed under en <a href="https://github.com/SDFIdk/skraafoto_frontend/blob/main/LICENSE">MIT licens, som er beskrevet i kildekoden.</a></p>

          <h3>Vil du vide mere om skråfoto?</h3>
          <p>
            Her finder du <a href="https://docs.dataforsyningen.dk/#skraafoto-stac-api-dokumentation">dokumentation på SkråfotoAPI.</a><br>
            Her finder du <a href="https://confluence.sdfi.dk/x/MAHiCQ">vejledningen til Skråfotoløsningen.</a>
          </p>
          
        </div>

        <div style="background-color: var(--bg0); padding: var(--space) var(--space-lg) var(--space-lg);">
          <ds-logo-title class="transparent" title="Klimadatastyrelsen"></ds-logo-title>  
          <hr>
          <p>
            <small>
              Sankt Kjelds Plads 11<br>
              2100 København Ø<br>
              7254 5500<br>
              kds@kds.dk<br>
              EAN-nr: 5798009813640<br>
              CVR-nr: 37284114
            </small>
          </p>
          <hr>
          <p>© 2024 Klimadatastyrelsen</p>
        </div>

      </article>
      <footer style="justify-content: center; padding: var(--space) var(--space-lg) var(--space-lg); background-color: var(--bg0);">
        <button class="btn-toggle-dialog" aria-controls="info-dialog">Luk</button>
      </footer>
    </dialog> 
  `

  constructor() {
    super()
  }

  connectedCallback() {
    this.innerHTML = this.template
    this.dialogElement = this.querySelector('#info-dialog')
    this.querySelectorAll('[aria-controls="info-dialog"]').forEach((element) => {
      element.addEventListener('click', this.toggleDialog.bind(this))
    })

  }

  toggleDialog() {
    if (this.dialogElement.open) {
      this.dialogElement.close()
    } else {
      this.dialogElement.showModal()
    }
  }

}