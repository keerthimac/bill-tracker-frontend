import "./App.css";
import SiteList from "./features/sites/SiteList";
import AddSiteForm from "./features/sites/AddSiteForm"; // <<< IMPORT
import ItemCategoryList from "./features/itemCategories/ItemCategoryList";
import SupplierList from "./features/suppliers/SupplierList";
import AddItemCategoryForm from "./features/itemCategories/AddItemCategoryForm";
import AddSupplierForm from "./features/suppliers/AddSupplierForm";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Bill Tracker System - React Frontend</h1>
      </header>
      <main>
        <section>
          <AddSiteForm />
          <SiteList />
        </section>
        <hr />
        <section>
          {" "}
          {/* Added section for clarity */}
          <AddItemCategoryForm /> {/* <<< ADD THE FORM */}
          <ItemCategoryList />
        </section>
        <hr />
        <section>
          <AddSupplierForm /> {/* <<< ADD THE FORM */}
          <SupplierList />  
        </section>
      </main>
    </div>
  );
}

export default App;
