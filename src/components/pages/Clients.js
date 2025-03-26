import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faHome, faDownload, faPlus, faSearch, faEye, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "/home/digilab/timesheet/timesheet-mern/client/src/styles/Client.scss";

const Clients = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy client data
  const clients = [
    { id: 1, name: "Elon Musk", email: "elonmusk@tesla.com", phone: "8527419630", address: "--", notes: "--" },
    { id: 2, name: "Bill Gates", email: "billgates@microsoft.com", phone: "9876543210", address: "--", notes: "--" },
  ];

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="clients-container">
      {/* Clients Header with Icon */}
      <div className="clients-header">
        <h2>
          <FontAwesomeIcon icon={faUsers} /> Clients
        </h2>
      </div>

      {/* Breadcrumb Navigation & Actions */}
      <div className="clients-top">
        <div className="breadcrumb">
          <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
          <span> / </span>
          <span>Clients</span>
        </div>

        <div className="clients-actions">
          <button className="download-button">
            <FontAwesomeIcon icon={faDownload} /> Download
          </button>
          <Link to="/clients/create" className="add-client-button">
            <FontAwesomeIcon icon={faPlus} /> Add New Client
          </Link>
        </div>
      </div>

      {/* Search Box */}
      <div className="clients-search">
        <input
          type="text"
          placeholder="Search by Client Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="search-button">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>

      {/* Clients List */}
      <div className="clients-list">
        {/* Clients Table */}
        <div className="clients-table">
          <div className="clients-table-header">
            <div>Client Name</div>
            <div>Email Address</div>
            <div>Phone Number</div>
            <div>Address</div>
            <div>Notes</div>
            <div>Actions</div>
          </div>

          {filteredClients.map((client) => (
            <div className="clients-table-row" key={client.id}>
              <div>{client.name}</div>
              <div>{client.email}</div>
              <div>{client.phone}</div>
              <div>{client.address}</div>
              <div>{client.notes}</div>
              <div className="clients-actions">
                <Link to={`/clients/view/${client.id}`} className="view-button">
                  <FontAwesomeIcon icon={faEye} />
                </Link>
                <Link to={`/clients/update/${client.id}`} className="edit-button">
                  <FontAwesomeIcon icon={faEdit} />
                </Link>
                <button className="delete-button">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clients;
