import AddIcon from '@mui/icons-material/Add';
import React from 'react';

type TabNavProps = {
    addMessage: string,
    tabs: string[],
    selected: number,
    modifiedIndex: number,
    children: React.ReactNode,    
    addTab: () => void,
    setSelected: (index: number) => void
}

export default function TabNav(props: TabNavProps) {
    return (
        <div className="row">
            <div className="col-3">
                <ul className="nav flex-column nav-pills text-center"
                    id="v-pills-tab"
                    role="tablist"
                    aria-orientation="vertical">
                    {
                        props.tabs.map((tab, index) => {
                            const active = (index === props.selected) ? 'active' : '';
                            return (
                                <li className="nav-item" key={tab}>
                                    <a
                                        className={`nav-link ${active}`}
                                        id={`v-pills-${tab}-tab`}
                                        data-mdb-toggle="pill"
                                        role="tab"
                                        onClick={() => props.setSelected(index)}
                                    >
                                        {index == props.modifiedIndex ?  tab + '*' : tab}
                                    </a>
                                </li>
                            );
                        })
                    }
                    <li className="nav-item" key="add-item">
                        <a
                            className="nav-link"
                            id="v-pills-add-item-tab"
                            data-mdb-toggle="pill"
                            role="tab"
                            onClick={props.addTab}
                        >
                            <AddIcon /> {props.addMessage}
                        </a>
                    </li>
                </ul>
            </div>
            <div className="col-9">
                {props.children}
            </div>
        </div>
    );
}