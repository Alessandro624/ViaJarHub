# ViaJarHub - Guida alla Configurazione

Benvenuto in **ViaJarHub**, la piattaforma di prenotazione viaggi. Segui questa guida per configurare e avviare il progetto in locale.

### **In questa guida e nei file scaricabili non sono presenti le API KEY**

---

## Configurazione Backend

### 1. Imposta le variabili d'ambiente

Aggiungi le seguenti variabili d'ambiente per l'utente corrente:

- **GOOGLE_CLIENT_ID_VIAJARHUB**: `---`
- **POSTGRES_PASSWORD**: La tua password per il database Postgres
- **POSTGRES_USER**: Il tuo nome utente per il database Postgres
- **STRIPE_VIAJARHUB**: `---`

> **Nota:** Dopo aver configurato le variabili d'ambiente, riavvia il computer per applicare le modifiche.

### 2. Ripristina il database

1. Apri **DBEaver** e connettiti al database Postgres.
2. Se è presente una copia del database `viajarhub`, **eliminala**.
3. Crea un nuovo database chiamato `viajarhub`.
4. Ripristina il database:
   - Clicca con il tasto destro sul nuovo database e seleziona **Strumenti > Ripristina**.
   - Seleziona il formato `tar`, spunta le opzioni **clean (drop)** e **crea database**.
   - Scegli il file di backup dalla cartella **db del Backend** (seleziona l'ultimo file disponibile, ovvero il più recente).
   - Avvia il ripristino.

### 3. Avvia il Backend

Ora il Backend è pronto per essere avviato.

---

## Configurazione Frontend

### 1. Installa le dipendenze

All'interno della cartella del Frontend, esegui il comando:

```bash
npm install
```

### 2. Configura l'ambiente

1. [Scarica **environments.zip**](https://drive.google.com/file/d/1LKvxvcL9I8eL0ZMTDGpIXJwOWDhkm-Qe/view?usp=sharing).
2. Estrai il contenuto e inseriscilo nella cartella `src` del Frontend.

### 3. Avvia il Frontend

Ora puoi avviare il Frontend.

---

## (Facoltativo) Caricare Dati di Test

Se desideri utilizzare dei dati di test già pronti:

1. [Scarica **test.zip**](https://drive.google.com/file/d/1IcgBrPuM-B-SFLC0gJHb6Zz8dlW0pDP2/view?usp=sharing).
2. Estrai le cartelle **reviewImages** e **travelImages** e inseriscile nella cartella principale del Backend (allo stesso livello delle cartelle `db` e `postman`).
3. Aggiungi i dati al database:
   - In **DBEaver**, connettiti a Postgres, clicca con il tasto destro sul database viajarhub e seleziona **Strumenti > Esegui script**.
   - Seleziona il file **sqlinsert.sql**.
   - Avvia lo script.
4. Riavvia il Backend e il Frontend.

---

## (Facoltativo) Presentazione del Progetto

Per una panoramica rapida del progetto, consulta la seguente presentazione:  
[**Introduzione a ViaJarHub**](https://docs.google.com/presentation/d/194_pXaFcMFMPWXkD8at3ncD_3vwD5Bp_rfv4BZX3r98/edit?usp=sharing)

---

## Supporto

Se riscontri problemi, non esitare a contattarci.
