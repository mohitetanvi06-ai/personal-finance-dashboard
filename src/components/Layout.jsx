import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="d-flex">

      <Sidebar />

      <div className="main-content">

        <Navbar />

        <div className="container-fluid p-4">
          {children}
        </div>

      </div>

    </div>
  );
}

export default Layout;