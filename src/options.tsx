import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css'
import './Options.css';
import { createRoot } from "react-dom/client";
import TabNav from './components/TabNav';
import Tab from './components/Tab';
import ClassPage from './components/ClassPage';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export type LEOClass = {
  id: number,
  name: string,
  aliases: Record<string, string>
}

const Options = () => {
  useEffect(() => {
    const fetchData = async () => {
      let state = await chrome.storage.sync.get("data");
      if (state.data !== undefined) {
        setClasses(state.data);
      }
    }

    fetchData();
  }, []);

  const [selected, setSelected] = useState<number>(-1);
  const [classes, setClasses] = useState<LEOClass[]>([]);
  const [pendingSelection, setPendingSelection] = useState<number>(-1);
  const [showSavedBanner, setShowSavedBanner] = useState<boolean>(false);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] = useState<boolean>(false);

  const addClass = () => {
    setClasses([
      ...classes,
      {
        id: 1,
        name: "New Class",
        aliases: {}
      }
    ]);

    processSelectionChange(Object.keys(classes).length);
  }

  const deleteClass = (index: number) => {
    const classesClone = [...classes];
    classesClone.splice(index, 1);
    setClasses(classesClone);
    // We don't need to call processSelectionChange here because the user already confirmed the deletion
    setUnsavedChanges(false);
    setSelected(-1);
    saveData(classesClone);
  }

  const saveData = async (classesToSave: LEOClass[]) => {
    setShowSavedBanner(true);
    await chrome.storage.sync.set({ data: classesToSave });
    await new Promise(resolve => setTimeout(resolve, 2000));
    setShowSavedBanner(false);
  }

  const saveClass = (leoClass: LEOClass) => {
    const classesClone = [...classes];
    classesClone[selected] = leoClass;
    setClasses(classesClone);
    setUnsavedChanges(false);
    
    saveData(classesClone);
  }

  const forceSelectionChange = () => {
    setUnsavedChangesDialogOpen(false);
    setUnsavedChanges(false);
    setSelected(pendingSelection);
  }

  const processSelectionChange = (index: number) => {
    if (unsavedChanges) {
      setPendingSelection(index);
      setUnsavedChangesDialogOpen(true);
    } else {
      setSelected(index);
    }
  }

  return (
    <div className="App">
      <header>
        <div className="navbar navbar-dark bg-dark box-shadow">
          <div className="container">
            <div className="navbar-brand">LEO AKA</div>
            {showSavedBanner && <div className="saved-banner" role="alert">Saved!</div>}
          </div>
        </div>
      </header>
      <div className="container mt-5">
        <TabNav
          tabs={classes.map((leoClass) => leoClass.name)}
          selected={selected}
          modifiedIndex={unsavedChanges ? selected : -1}
          addMessage="ADD CLASS"
          addTab={addClass}
          setSelected={processSelectionChange}
        >
          {
            selected !== -1 && classes && classes.length > 0 ? ( 
              classes.map((leoClass, index) => 
                (
                  <Tab isSelected={selected === index} key={index}>
                    <ClassPage
                      name={leoClass.name}
                      id={leoClass.id.toString()}
                      aliases={leoClass.aliases}
                      onDelete={() => deleteClass(index)}
                      onSave={saveClass}
                      onUnsavedChanges={() => setUnsavedChanges(true)}
                    />
                  </Tab>
                ))
            ) : (
              <Tab isSelected={true}>
                <div className="alert alert-info" role="alert">Use the tabs on the left to select an existing class, 
                or create a new class to track by clicking the ADD CLASS button</div>
              </Tab>
            )
          }
        </TabNav>
      </div>
      <Dialog
        open={unsavedChangesDialogOpen}
        onClose={() => setUnsavedChangesDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>
          Unsaved changes
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">You have unsaved changes. Would you like to discard your changes by navigating away?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => forceSelectionChange()}>Discard changes</Button>
          <Button onClick={() => setUnsavedChangesDialogOpen(false)} autoFocus>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>
);
