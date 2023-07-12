import AddIcon from '@mui/icons-material/Add';
import CancelIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import React, { useState } from 'react';
import { Button, Dialog, DialogContent, DialogContentText, DialogActions, DialogTitle } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColDef, GridEventListener, GridRowEditStopReasons, GridRowId, GridRowModel, GridRowModes, GridRowModesModel, GridRowsProp, GridToolbarContainer } from '@mui/x-data-grid';
import { LEOClass } from '../options';

var globalId = 1;

type ClassPageProps = {
    name: string,
    id: string,
    aliases: Record<string, string>,
    onDelete: () => void,
    onSave: (leoClass: LEOClass) => void,
    onUnsavedChanges: () => void
}

type EditToolbarProps = {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
        newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
}

function EditToolbar(props: EditToolbarProps) {
    const { setRows, setRowModesModel } = props;

    const handleClick = () => {
        const id = globalId++;
        setRows((oldRows) => [...oldRows, { id, name: '', alias: '', isNew: true }]);
        setRowModesModel((oldModel) => ({
            ...oldModel,
            [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
        }));
    };

    return (
        <GridToolbarContainer>
            <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
                Add record
            </Button>
        </GridToolbarContainer>
    );
}

export default function ClassPage({ name, id, aliases, onDelete, onSave, onUnsavedChanges }: ClassPageProps) {
    const [rows, setRows] = useState<GridRowsProp>(Object.entries(aliases).map(([name, alias]) => ({ id: globalId++, name, alias })));
    const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [nameOfClass, setNameOfClass] = useState(name);
    const [idOfClass, setIdOfClass] = useState(id);

    const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    const handleEditClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleSaveClick = (id: GridRowId) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleDeleteClick = (id: GridRowId) => () => {
        setRows(rows.filter((row) => row.id !== id));
    };

    const handleCancelClick = (id: GridRowId) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow!.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const processRowUpdate = (newRow: GridRowModel) => {
        onUnsavedChanges();
        const updatedRow = { ...newRow, isNew: false };
        setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        return updatedRow;
    };

    const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: 'Name', flex: 1, editable: true },
        { field: 'alias', headerName: 'Preferred', flex: 1, editable: true },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            cellClassName: 'actions',
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveIcon />}
                            label="Save"
                            sx={{
                                color: 'primary.main',
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem
                            icon={<CancelIcon />}
                            label="Cancel"
                            className="textPrimary"
                            onClick={handleCancelClick(id)}
                            color="inherit"
                        />,
                    ];
                }

                return [
                    <GridActionsCellItem
                        icon={<EditIcon />}
                        label="Edit"
                        className="textPrimary"
                        onClick={handleEditClick(id)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<DeleteIcon />}
                        label="Delete"
                        onClick={handleDeleteClick(id)}
                        color="inherit"
                    />,
                ];
            }
        }
    ];

    const handleDeleteDialogClose = (deleteConfirmed: boolean) => {
        setDeleteDialogOpen(false);
        if (deleteConfirmed) {
            onDelete();
        }
    };

    const handleSaveButtonClick = () => {
        onSave({ name: nameOfClass, id: parseInt(idOfClass), aliases: rows.reduce((acc, row) => ({ ...acc, [row.name]: row.alias }), {}) });
    }

    const updateName = (newName: string) => {
        setNameOfClass(newName);
        onUnsavedChanges();
    }

    const updateId = (newId: string) => {
        setIdOfClass(newId);
        onUnsavedChanges();
    }

    return (
        <div>
            <h1>
                {nameOfClass}
            </h1>
            <div className="form-group">
                <label className="form-label" htmlFor="nameInput">The class name that these student preferred names are from</label>
                <input type="text" id="nameInput" className="form-control" value={nameOfClass} onChange={(event) => updateName(event.target.value)} />
            </div>
            <label htmlFor="idInput" className="form-label mt-3">The unique id from the URL for this class</label>
            <div className="input-group mb-3">
                <div className="input-group-prepend">
                    <span className="input-group-text" id="basic-addon3">https://learn.umgc.edu/d2l/home/</span>
                </div>
                <input type="text" id="idInput" className="form-control" value={idOfClass} onChange={(event) => updateId(event.target.value)} />
            </div>
            <label className="form-label mt-3">The preferred names for this class</label>
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle>
                    Confirm delete
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">Are you sure you want to delete this class and all associated preferred names?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDeleteDialogClose(true)} autoFocus color='error'>Delete</Button>
                    <Button onClick={() => handleDeleteDialogClose(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
            <DataGrid
                rows={rows}
                columns={columns}
                editMode="row"
                rowModesModel={rowModesModel}
                onRowModesModelChange={handleRowModesModelChange}
                onRowEditStop={handleRowEditStop}
                processRowUpdate={processRowUpdate}
                slots={{ toolbar: EditToolbar }}
                slotProps={{
                    toolbar: { setRows, setRowModesModel }
                }} />
            <div className="row mt-3">
                <div className="col">
                    <Button color="primary" className="float-end" startIcon={<SaveIcon />} onClick={handleSaveButtonClick}>
                        Save
                    </Button>
                    <Button color="error" className="float-end" startIcon={<DeleteIcon />} onClick={() => setDeleteDialogOpen(true)}>
                        Delete
                    </Button>                    
                </div>
            </div>
        </div>
    );
}