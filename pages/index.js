import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react';
import Select from 'react-select'
import { useTheme } from 'next-themes'

export async function getStaticProps(context) {
  try {
    const apps = await require('../lib/apps.json')

    if (process.env.ACTIVE !== true) {
      return { props: { apps: JSON.stringify([]) } }
    }
  
    const array = []
    Object.entries(apps).forEach(([key, value]) => {
      // If we successfully parse, we assume its a valid app.
        const num = parseInt(key)
        if (!isNaN(num))
          array.push(value)
    })
  
    return {
      props: { apps: JSON.stringify(array) },
    }
  } catch  (e) {
    // If no apps.json file is found
    if (e?.code === 'MODULE_NOT_FOUND') {
      return {
        props: { apps: JSON.stringify([]) },
      }
    } else {
      throw e;
    }
  }
 
}

export default function Home({ apps }) {
  apps = JSON.parse(apps);
  const [currApp, setApp] = useLocalStorage('currApp', 0);
  const year = new Date().getFullYear();
  const [note, setNote] = useLocalStorage(`note-${currApp}-${year}`, '');
  const [selectedOption, setSelectedOption] = useState('');
  const { theme, setTheme } = useTheme()

  const options = [];

  const app = apps[currApp]

  if (!app) {
    return <>nice try</>
  }

  Object.keys(apps).forEach((e, i) => {
    if (apps[i] && apps[i]['First Name']) {
      options.push({
        value: i,
        label: `${apps[i]['First Name']} ${apps[i]['Last Name']}`
      })
    }
  })


  const QA = ({ q }) => {
    return (<><h3>{q}</h3>
    <p>
      {app[q]}
    </p></>)
  }

  const nextApp = () => {
    if (currApp === justApps.length) {
      return
    }
    localStorage.setItem('currApp', currApp + 1);
    setApp(currApp + 1)
  }

  const prevApp = () => {
    if (currApp === 0) {
      return
    }
    localStorage.setItem('currApp', currApp - 1);
    setApp(currApp - 1)
  }

  const handleNoteChange = e => {
    localStorage.setItem(`note-${currApp}`, e.target.value);
    setNote(e.target.value);
  };

  const handleSelectChange = selectedOption => {
    if (!selectedOption) {
      return;
    }
    setSelectedOption(selectedOption);

    setApp(selectedOption.value)
  };

  const exportNotes = () => {
    const list = []
    list.push(["Name", "Note"]);
    for (let i = 0; i < justApps.length; i++) {
      const note = localStorage.getItem(`note-${i}`);
  
      if (note) {
        list.push([apps[i]['First Name'] + " " + apps[i]['Last Name'], note])
      }
    }

    const csvContent = list.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", 'exportedNotes.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }

  const customStyles = {
    option: provided => ({
      ...provided,
      color: 'black'
    }),
    control: provided => ({
      ...provided,
      color: 'black'
    }),
    singleValue: provided => ({
      ...provided,
      color: 'black'
    }),
    
  }

  const justApps = Object.entries(apps).filter(([_, app]) => app["First Name"] !== undefined);
  const displayLength = justApps.length - 1; // because we index at 0.
  const id = app["Please upload a recent headshot. Label the file \"Last-name First-name Headshot\". PLEASE USE A JPEG/JPG"].split('id=')[1].split('&')[0];
  return (
    <div className={styles.container}>
      <Head>
        <title>Super Secret App Reviewer 2 - The Second Super Secret App Review</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <span className={styles['grid-container']}>
          <div className={styles.header}>
          <div>Theme: {theme !== undefined && (
              <select value={theme} onChange={e => setTheme(e.target.value)}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            )}</div>
            <h1 style={{display: 'inline-block', marginRight: 110}}>Theta Tau App Review</h1> 
            <span style={{width: 250, display: 'inline-block'}}><Select 
            value={selectedOption}
            onChange={handleSelectChange}
            styles={customStyles} isSearchable={true} options={options} /> </span>
          </div>
          <div className={styles.notes}>
            <span className={styles.notesSticky} style={{width: '80%'}}>
              <h2>Notes</h2>
              <button style={{marginBottom: 16, width: 150}} onClick={exportNotes}>Export notes</button>
              <textarea    
                value={note}
                onChange={handleNoteChange}
                placeholder="Add notes here 📝" style={{display: 'block', width: '90%', height: '50vh'}}>
              </textarea>
            </span>
          </div>
          <main className={styles.apps}>
            {currApp === 0 && <p style={{background: 'var(--warning)', color: 'white', borderRadius: 8, padding: 8}}>PLEASE READ: notes are per-application, stored locally, and can be exported for easy viewing at delibs. please dont share this site. the source code is <u><a href="https://github.com/maxLeiter/thetattauappreviewer">here</a></u>.</p>}
            {currApp !== 0 && <h2>{app['First Name']} {app['Last Name']} - app {currApp} of {displayLength}</h2>}
            {currApp === 0 && <h2>{app['First Name']} {app['Last Name']} - app <abbr title="This is CS, we start at 0. Sorry for being lazy">{currApp}</abbr> of {displayLength}</h2>}
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <button onClick={prevApp}>
                &#171; Prev
              </button>
              <button onClick={nextApp}>
                Next &#187;
              </button>
            </div>
            <h3>Info</h3>
            <p style={{display: 'flex', flexDirection: 'column'}}> 
              <span><span className={styles.info}>Pronouns:</span> <span>{app['Pronouns']}</span></span>
              <span><span className={styles.info}>Class Standing:</span> <span>{app['Class Standing']}</span></span>
              <span><span className={styles.info}>Major:</span> <span>{app['Declared Major']} {app['What is your second major?']}</span></span>
              {app['Do you have a minor?'] === "Yes" && <span><span className={styles.info}>Minor(s):</span> <span>{app['What is your minor(s)?']} </span></span>}
              <span><span className={styles.info}>GPA:</span> <span>{app['What is your cumulative GPA?']}</span></span>
            </p>
            <div>
              <img src={`https://drive.google.com/thumbnail?id=${id}`} alt="image" />
            </div>
            <a target="_blank" rel="noreferrer" href={app["Please upload your resume. Label the file \"Last-name First-name Resume\"."]}><button style={{width: 150}}>View Resume</button></a>
            <a target="_blank" rel="noreferrer" href={app["Please upload a recent headshot. Label the file \"Last-name First-name Headshot\"."]}><button style={{width: 150, marginLeft: 8}}>View Headshot</button></a>
            <QA q="How did you hear about Theta Tau?"/>
            <QA q="Did you contract COVID-19 during the recruitment process (to ensure all candidates are given a fair evaluation and invite eligible candidates to a virtual event)?"/>
            <QA q="Which rush events did you attend (or which will you attend)?"/>
            <QA q="Why do you want to join Theta Tau? Which of the three pillars (Service, Professionalism, or Social) resonates most with you? (250 Words)"/>
            <QA q="The three pillars of Theta Tau are Service, Professionalism, and Social. If you could plan one event for the organization related to one (or more) of these principles, what would it be? Briefly describe your event. (200 Words)" />
            <QA q="What THREE books/movies/TV shows describe you most accurately (without explaining why they describe you)." />
            <QA q="What fictional character do you feel best represents you AND why? (100 Words)" />
            <QA q="You wake up one day in a ghost town with no idea how you got there. You recognize the area as being somewhere in Montana from a game of GeoGuessr you played and realize that the closest human being is 150 miles away. Unfortunately, your pockets have been emptied and all you have is a can of spray paint. You luckily stumble upon a backpack that has a single strike-anywhere match, a potato, a thermos, an old school video camera, a tennis ball, tweezers, an apple, a swiss army knife, two pieces of scrap wood, a mirror, and a blank canvas. You know that a train is going to pass through this town in 10 days, which means you must keep yourself alive and entertained for that amount of time. Describe which materials you would use to survive this situation. Feel free to use natural resources to help with your creations (250 Words)." />
            {app["Optional: Upload a photo of your creation if you feel words can't do it justice."] && <a href={app["Optional: Upload a photo of your creation if you feel words can't do it justice."]} rel="noreferrer" target="_blank"><button style={{width: 300}}>Open image of creation</button></a>}
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <button onClick={prevApp}>
                &#171; Prev
              </button>
              <button onClick={nextApp}>
                Next &#187;
              </button>
            </div>
          </main>

        </span>
      </main>
    </div>
  )
}

const storage = {
  getItem(key, initialValue) {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const unparsedValue = window.localStorage[key];
      if (typeof unparsedValue === "undefined") {
        return initialValue;
      }
      return JSON.parse(unparsedValue);
    } catch (error) {
      return initialValue;
    }
  },

  setItem(key, value) {
    window.localStorage[key] = JSON.stringify(value);
  },
};

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(storage.getItem(key, initialValue));
  }, [key, initialValue]);

  const setItem = (newValue) => {
    setValue(newValue);
    storage.setItem(key, newValue);
  };

  return [value, setItem];
}
