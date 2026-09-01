type FooterProps = {};

const Footer = ({}: FooterProps) => {
  return (
    <footer className="w-full bg-(--text-clr)/10 text-(--text-clr-muted) text-center py-10 mt-25">
      &copy; {new Date().getFullYear()} Electronics. All Rights Reserved
    </footer>
  );
};

export default Footer;
