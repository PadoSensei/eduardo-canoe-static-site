import Header from "./Header";
// You can create Footer.jsx similarly, for now we can omit or add later
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">{children}</main>
      {/* <Footer /> */}
    </div>
  );
};
export default Layout;
