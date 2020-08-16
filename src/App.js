import React from 'react';
import logo from './logo.svg';
import './App.css';
import createGun from './gun'
import { GunProvider } from './context'
import Sidebar from "./components/Sidebar";
import 'bootstrap/dist/css/bootstrap.min.css';
import SplitPane from 'react-split-pane'
import Main from './components/Main'

var gun

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);

  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        gun = await createGun(true)
        window.gun = gun
        
        setLoadingComplete(true);

      } catch (e) {
        console.log('loadResourcesAndDataAsync FAILED')
        throw e
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  const [selectedTags, setSelectedTags] = React.useState({})

  if (!isLoadingComplete) {
      return null;
  } else {
    return (  
        <GunProvider value={gun}>
          <SplitPane split="vertical" minSize={50} defaultSize={200} allowResize>
            <Sidebar selectedTags={selectedTags} setSelectedTags={setSelectedTags}/>
            <Main selectedTags={selectedTags}/>
          </SplitPane>
        </GunProvider>
    );
  }
}