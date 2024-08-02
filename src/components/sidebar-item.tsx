interface sidebarItemProps {
  imgSrc: string;
  itemtext: string;
  isSelected?:boolean;
}

export default function SidebarItem(props: sidebarItemProps) {

  const selected = props.isSelected? "selected":""
  return (
    <div className={ "sidebar-item " +  selected}>
      <img src={props.imgSrc} width={32} height={32} />
      <p>{props.itemtext}</p>
    </div>
  );
}
